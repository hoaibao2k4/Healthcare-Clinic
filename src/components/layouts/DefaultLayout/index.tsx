import * as React from "react";
import { createTheme, styled } from "@mui/material/styles";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BarChartIcon from "@mui/icons-material/BarChart";
import DescriptionIcon from "@mui/icons-material/Description";
import LayersIcon from "@mui/icons-material/Layers";
import {
  AppProvider,
  Navigation,
  Router,
  type Session,
} from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { PageContainer } from "@toolpad/core/PageContainer";
import Grid from "@mui/material/Grid";
import { useNavigate, useLocation } from "react-router-dom";
import FeaturedPlayListIcon from "@mui/icons-material/FeaturedPlayList";
import QueuePlayNextIcon from "@mui/icons-material/QueuePlayNext";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import { useSelector } from "react-redux";
import { persistor, RootState } from "@/redux/store";
import RoleModal from "../components/Modal/Roles";
import PriceChangeIcon from "@mui/icons-material/PriceChange";
import PaidIcon from "@mui/icons-material/Paid";
import MedicationIcon from "@mui/icons-material/Medication";
import logo from "@/assets/icons/v987-18a-removebg-preview.png";
import avatar from "@/assets/images/doctorAvatar.jpg";
import MedicationLiquidIcon from "@mui/icons-material/MedicationLiquid";
import VaccinesIcon from "@mui/icons-material/Vaccines";
import SanitizerIcon from "@mui/icons-material/Sanitizer";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { Permission } from "@/types";

type NavigationPageWithPermission = {
  kind?: "page";
  segment: string;
  title: string;
  icon?: React.ReactNode;
  permissions?: string[];
  children?: NavigationPageWithPermission[];
};

type NavigationHeaderWithPermission = {
  kind: "header";
  title: string;
};

type NavigationDividerWithPermission = {
  kind: "divider";
};

type NavigationItemWithPermission =
  | NavigationPageWithPermission
  | NavigationHeaderWithPermission
  | NavigationDividerWithPermission;

const NAVIGATION: NavigationItemWithPermission[] = [
  {
    kind: "header",
    title: "Chức năng",
  },
  {
    segment: "dashboard",
    title: "Bảng điều khiển",
    icon: <DashboardIcon />,
    permissions: ["ACCESS_DASHBOARD"],
  },
  {
    segment: "staff",
    title: "Quản lí nhân sự",
    icon: <PeopleAltIcon />,
    permissions: ["ADMIN"],
    children: [
      {
        segment: "supporters",
        title: "Quản lí nhân viên",
        icon: <PeopleAltIcon />,
        permissions: ["ADMIN"],
      },
      {
        segment: "doctors",
        title: "Quản lí bác sĩ",
        icon: <PeopleAltIcon />,
        permissions: ["ADMIN"],
      },
    ],
  },
  {
    segment: "admin",
    title: "Quản lí phân quyền",
    icon: <PeopleAltIcon />,
    permissions: ["ADMIN"],
    children: [
      {
        segment: "role",
        title: "Quản lí vai trò",
        icon: <PeopleAltIcon />,
        permissions: ["ADMIN"],
      },
      {
        segment: "permission",
        title: "Quản lí quyền",
        icon: <PeopleAltIcon />,
        permissions: ["ADMIN"],
      },
    ],
  },
  {
    segment: "exams",
    title: "Danh sách đăng kí khám",
    icon: <FeaturedPlayListIcon />,
    permissions: ["SUPPORTER", "ADMIN"],
  },
  {
    segment: "waiting",
    title: "Danh sách khám bệnh",
    icon: <FeaturedPlayListIcon />,
    permissions: ["DOCTOR"],
  },
  {
    segment: "records",
    title: "Phiếu khám bệnh",
    icon: <QueuePlayNextIcon />,
    permissions: ["DOCTOR"],
  },
  {
    segment: "patients",
    title: "Danh sách bệnh nhân",
    icon: <AccountBoxIcon />,
    permissions: ["DOCTOR"],
  },
  {
    segment: "drugs",
    title: "Quản lí thuốc",
    icon: <MedicationLiquidIcon />,
    permissions: ["ADMIN"],
    children: [
      {
        segment: "drugs-unit",
        title: "Đơn vị thuốc",
        icon: <VaccinesIcon />,
        permissions: ["ADMIN"],
      },
      {
        segment: "disease",
        title: "Danh sách bệnh",
        icon: <DescriptionIcon />,
        permissions: ["ADMIN"],
      },
      {
        segment: "drugs-type",
        title: "Loại thuốc",
        icon: <SanitizerIcon />,
        permissions: ["ADMIN"],
      },
    ],
  },
  {
    segment: "invoice",
    title: "Quản lí hóa đơn",
    icon: <PriceChangeIcon />,
    permissions: ["DOCTOR", "ADMIN"],
  },
  {
    kind: "divider",
  },
  {
    kind: "header",
    title: "Phân tích",
  },
  {
    segment: "reports",
    title: "Báo cáo",
    icon: <BarChartIcon />,
    permissions: ["ADMIN"],
    children: [
      {
        segment: "revenue",
        title: "Doanh thu",
        icon: <PaidIcon />,
        permissions: ["ADMIN"],
      },
      {
        segment: "drug-usage",
        title: "Sử dụng thuốc",
        icon: <MedicationIcon />,
        permissions: ["ADMIN"],
      },
    ],
  },
  {
    segment: "integrations",
    title: "Cài đặt",
    icon: <LayersIcon />,
    permissions: ["ADMIN"],
  },
];

function filterNavigationByPermission(
  items: NavigationItemWithPermission[],
  userPermissions: Permission[],
  role: string
): Navigation {
  return items
    .map((item) => {
      if (item.kind === "header" || item.kind === "divider") return item;
      if (item.segment === "dashboard")
        //|| item.segment === "integrations")
        return item;
      if (
        role === "ADMIN"
        // (item.segment === "staff" ||
        //   item.segment === "admin" ||
        //   item.segment === "invoice" ||
        //   item.segment === "drugs" ||
        //   item.segment === "reports" ||
        //   item.segment === "integrations")
      ) {
        return {
          ...item,
          ...(item.children ? { children: item.children } : {}),
        };
      }

      if (item.segment) {
        const matchedPermission = userPermissions.find(
          (p) =>
            p.permission === item.segment &&
            (p.can_create || p.can_read || p.can_update)
        );

        if (matchedPermission) {
          const { permissions, ...rest } = item;
          return {
            ...rest,
            ...(item.children ? { children: item.children } : {}),
          };
        }
      }

      return null;
    })
    .filter(Boolean) as Navigation;
}

const demoTheme = createTheme({
  colorSchemes: { light: true, dark: true },
  cssVariables: {
    colorSchemeSelector: "class",
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

function useDemoRouter(initialPath: string): Router {
  const [pathname, setPathname] = React.useState(
    initialPath == "/" ? "/dashboard" : initialPath
  );
  const location = useLocation();
  const navigate = useNavigate();

  const router = React.useMemo(() => {
    return {
      pathname: location.pathname == "/" ? "/dashboard" : location.pathname,
      searchParams: new URLSearchParams(location.search),
      navigate: (path: string | URL) => {
        const pathStr = path.toString();
        setPathname(pathStr);
        1;
        navigate(pathStr);
      },
    };
  }, [location, navigate, pathname]);

  return router;
}

const Skeleton = styled("div")<{ height: number }>(({ theme, height }) => ({
  backgroundColor: theme.palette.action.hover,
  borderRadius: theme.shape.borderRadius,
  height,
  content: '" "',
}));

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useDemoRouter("/");
  const user = useSelector((state: RootState) => state.auth.login.currentUser);
  const permission = useSelector(
    (state: RootState) => state.permission.login.currentUser
  );

  const [session, setSession] = React.useState<Session | null>({
    user: {
      name: user?.username,
      email: `${user?.username}healthcare@gmail.com`,
      image: avatar,
    },
  });
  const navigate = useNavigate();
  const authentication = React.useMemo(() => {
    return {
      signIn: () => {
        setSession({
          user: {
            name: user?.username,
            email: "bharatkashyap@outlook.com",
            image: "https://avatars.githubusercontent.com/u/19550456",
          },
        });
      },
      signOut: () => {
        persistor.purge();
        localStorage.removeItem("chosenRole");
        navigate("/login");
      },
    };
  }, [user]);
  //
  let navigation;
  console.log(permission)

  if (permission) {
    navigation = filterNavigationByPermission(
      NAVIGATION,
      permission.permissionList,
      permission.selected_role
    );
  }

  return (
    <AppProvider
      session={session}
      authentication={authentication}
      navigation={navigation}
      router={router}
      theme={demoTheme}
      branding={{
        logo: <img src={logo} alt="Healthcare SG" />,
        title: "Healthcare SG",
        //homeUrl: '/toolpad/core/introduction',
      }}
    >
      <div className="bg-[#2e37a40d]">
        <RoleModal user={user} />
        <DashboardLayout>
          <PageContainer>
            {children || (
              <Grid container spacing={1}>
                <Grid size={5} />
                <Grid size={12}>
                  <Skeleton height={14} />
                </Grid>
                <Grid size={12}>
                  <Skeleton height={14} />
                </Grid>
                <Grid size={4}>
                  <Skeleton height={100} />
                </Grid>
                <Grid size={8}>
                  <Skeleton height={100} />
                </Grid>

                <Grid size={12}>
                  <Skeleton height={150} />
                </Grid>
                <Grid size={12}>
                  <Skeleton height={14} />
                </Grid>

                <Grid size={3}>
                  <Skeleton height={100} />
                </Grid>
                <Grid size={3}>
                  <Skeleton height={100} />
                </Grid>
                <Grid size={3}>
                  <Skeleton height={100} />
                </Grid>
                <Grid size={3}>
                  <Skeleton height={100} />
                </Grid>
              </Grid>
            )}
          </PageContainer>
        </DashboardLayout>
      </div>
    </AppProvider>
  );
}
