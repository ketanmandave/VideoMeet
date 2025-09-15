import React, { useContext, useState } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import {
  Button,
  IconButton,
  TextField,
  Typography,
  Box,
  Paper,
  Divider,
} from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import { AuthContext } from "../context/AuthContext";

const HomePage = () => {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const { addToUserHistory } = useContext(AuthContext);

  const handleJoinVideoCall = async () => {
    if (!meetingCode.trim()) {
      alert("Please enter a meeting code");
      return;
    }
    try {
      await addToUserHistory(meetingCode);
      navigate(`/${meetingCode}`);
    } catch (err) {
      console.error("Error joining video call:", err);
      alert("Failed to join the meeting. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "linear-gradient(to right, #0f2027, #203a43, #2c5364)",
        color: "#fff",
      }}
    >
      {/* Navbar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 3,
          py: 2,
          backgroundColor: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Typography variant="h5" fontWeight="bold" sx={{ color: "#FF9839" }}>
          Video Meet
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            onClick={() => navigate("/history")}
            sx={{ color: "white" }}
          >
            <RestoreIcon />
          </IconButton>
          <Typography
            variant="body1"
            sx={{ cursor: "pointer" }}
            onClick={() => navigate("/history")}
          >
            History
          </Typography>

          <Button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/auth");
            }}
            variant="outlined"
            sx={{
              color: "white",
              borderColor: "white",
              "&:hover": {
                borderColor: "#ccc",
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          display: "flex",
          flex: 1,
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: "space-around",
          px: 3,
          py: 4,
          gap: 4,
        }}
      >
        {/* Left Section */}
        <Box sx={{ maxWidth: "500px", textAlign: { xs: "center", md: "left" } }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Join a Meeting Instantly
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.85 }}>
            Enter your meeting code below and connect with your friends, family,
            or colleagues right away.
          </Typography>

          <Paper
            elevation={6}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              p: 3,
              mt: 3,
              borderRadius: 3,
              backgroundColor: "rgba(255,255,255,0.08)",
            }}
          >
            <TextField
              onChange={(e) => setMeetingCode(e.target.value)}
              value={meetingCode}
              fullWidth
              label="Enter Meeting Code"
              variant="outlined"
              InputProps={{
                style: { color: "white" },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#ccc" },
                  "&:hover fieldset": { borderColor: "#fff" },
                  "&.Mui-focused fieldset": { borderColor: "#fff" },
                },
                "& .MuiInputLabel-root": { color: "#ddd" },
              }}
            />
            <Button
              onClick={handleJoinVideoCall}
              variant="contained"
              sx={{
                py: 1.2,
                fontWeight: "bold",
                bgcolor: "#FF9839",
                "&:hover": { bgcolor: "#e67e22" },
              }}
            >
              Join Meeting
            </Button>

            <Divider sx={{ my: 2, bgcolor: "rgba(255,255,255,0.2)" }} />

            <Button
              onClick={() => navigate("/guest")}
              variant="outlined"
              startIcon={<GroupAddIcon />}
              sx={{
                borderColor: "#ccc",
                color: "#fff",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              Join as Guest
            </Button>
          </Paper>
        </Box>

        {/* Right Section (Better Illustration) */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: { xs: 4, md: 0 },
          }}
        >
          <img
            src="/video.png"
            alt="Video Call Illustration"
            style={{
              width: "100%",
              maxWidth: "420px",
              borderRadius: "20px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}
          />

        </Box>
      </Box>
    </Box>
  );
};

export default withAuth(HomePage);
