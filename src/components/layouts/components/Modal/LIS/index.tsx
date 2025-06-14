import { Box } from "@mui/material";
import BloodRecord from "../../BloodRecord";
import { Patient } from "@/types";
interface IProps {
  patient: Patient
}
export default function BloodLab({patient} : IProps) {
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 1000,
    height: 500,
    bgcolor: "background.paper",
    border: "none",
    boxShadow: 24,
    p: 4,
    outline: "none",
    overflowY: "auto",
  };
  return (
    <Box sx={style}>
      <BloodRecord patient={patient}/>
    </Box>
  );
}
