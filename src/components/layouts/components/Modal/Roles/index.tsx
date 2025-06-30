import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { User } from "@/types";
import { loginPermission } from "@/api/apiAdmin";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  height: 300,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  border: "none",
  outline: "none",
  borderRadius: "4px",
};

const styleButton = {
  mt: 2,
  backgroundColor: "#3D90D7",
  cursor: "pointer",
  padding: "10px",
  paddingLeft: "20px",
  paddingRight: "20px",
  borderRadius: "4px",
  color: "white",
  ml: 1,
  mr: 1
};
interface RoleProps {
  user: User | null;
}
export default function RoleModal({ user }: RoleProps) {

  const [open, setOpen] = React.useState(() => {
    const role = localStorage.getItem("chosenRole");
    return !role;
  });

  React.useEffect(() => {
    if (user?.available_roles && user?.available_roles.length < 1) {
      setOpen(false)
    }
  }, [user])

  const dispatch = useDispatch();
  const handleLoginWithPermission = async (role: string) => {
    console.log(role);
    try {
      if (user?.username) {
        const res = await loginPermission(
          user?.username,
          role,
          user?.accessToken,
          dispatch
        );
        console.log(res);
        localStorage.setItem("chosenRole", role);
        setOpen(false);
        return res.data;
      }
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        return err.message || err.code;
      } else if (err instanceof Error) {
        return "Request Err: " + err.message;
      } else {
        return "Unknown error: " + err;
      }
    }
  };

  return (
    <div>
      <Modal
        open={open}
        //onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2" >
            Danh sách vai trò
          </Typography>
          {user?.available_roles.map((role, index) => (
            <Typography
              key={index}
              id="modal-modal-description"
              sx={styleButton}
              component="button"
              onClick={() => handleLoginWithPermission(role)}
            >
              {role}
            </Typography>
          ))}
        </Box>
      </Modal>
    </div>
  );
}
