import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AuthContext } from "../context/AuthContext";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const theme = createTheme();

export default function Authentication() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [err, setErr] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [formState, setFormState] = React.useState(0);
  const [open, setOpen] = React.useState(false);

  const { handleRegister, handleLogin } = React.useContext(AuthContext);

  const handleAuth = async () => {
    try {
      if (formState === 0) {
        let response = await handleLogin(username, password);
        setMessage(response?.data?.message || "Login successful!");
        setOpen(true);
        setErr("");
      } else {
        let response = await handleRegister(name, username, password);
        setMessage(response?.data?.message || "Registered successfully!");
        setOpen(true);
        setFormState(0);
        setErr("");
        setPassword("");
      }
    } catch (error) {
      let message = error.response?.data?.message || "Something went wrong!";
      setErr(message);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Grid
        container
        component="main"
        sx={{
          height: "100vh",
          background: "radial-gradient(circle at 30% 30%, #1a1a1a, #000)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: 2,
        }}
      >
        <CssBaseline />

        <Grid
          item
          xs={12}
          sm={10}
          md={4}
          component={Paper}
          elevation={6}
          sx={{
            backgroundColor: "#111",
            borderRadius: "16px",
            padding: { xs: 3, sm: 4 },
            maxWidth: 420,
            width: "100%",
            boxShadow:
              "0px 8px 30px rgba(255, 140, 0, 0.2), 0px 4px 10px rgba(0,0,0,0.6)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar
            sx={{
              m: 1,
              bgcolor: "#ff8c00",
              boxShadow: "0px 0px 15px rgba(255, 140, 0, 0.7)",
            }}
          >
            <LockOutlinedIcon />
          </Avatar>

          <Typography
            component="h1"
            variant="h5"
            sx={{
              mb: 3,
              color: "white",
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            {formState === 0 ? "Welcome Back" : "Create Your Account"}
          </Typography>

          {/* Toggle Buttons */}
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              mb: 3,
              width: "100%",
            }}
          >
            <Button
              fullWidth
              variant={formState === 0 ? "contained" : "outlined"}
              onClick={() => setFormState(0)}
              sx={{
                bgcolor: formState === 0 ? "#ff8c00" : "transparent",
                borderColor: "#ff8c00",
                color: formState === 0 ? "white" : "#ff8c00",
                "&:hover": { bgcolor: "#ff8c00cc" },
              }}
            >
              Sign In
            </Button>
            <Button
              fullWidth
              variant={formState === 1 ? "contained" : "outlined"}
              onClick={() => setFormState(1)}
              sx={{
                bgcolor: formState === 1 ? "#ff8c00" : "transparent",
                borderColor: "#ff8c00",
                color: formState === 1 ? "white" : "#ff8c00",
                "&:hover": { bgcolor: "#ff8c00cc" },
              }}
            >
              Sign Up
            </Button>
          </Box>

          <Box component="form" noValidate sx={{ width: "100%" }}>
            {formState === 1 && (
              <TextField
                margin="normal"
                required
                fullWidth
                id="fullname"
                label="Full Name"
                name="fullname"
                onChange={(e) => setName(e.target.value)}
                autoFocus
                InputProps={{ style: { color: "white" } }}
                InputLabelProps={{ style: { color: "#aaa" } }}
              />
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              onChange={(e) => setUsername(e.target.value)}
              InputProps={{ style: { color: "white" } }}
              InputLabelProps={{ style: { color: "#aaa" } }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              InputProps={{ style: { color: "white" } }}
              InputLabelProps={{ style: { color: "#aaa" } }}
            />

            {err && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {err}
              </Alert>
            )}

            <Button
              type="button"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                py: 1.4,
                fontSize: "1rem",
                bgcolor: "#ff8c00",
                "&:hover": { bgcolor: "#ff8c00cc" },
              }}
              onClick={handleAuth}
            >
              {formState === 0 ? "Sign In" : "Sign Up"}
            </Button>

            {formState === 0 && (
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => setFormState(1)}
                    sx={{ color: "#ff8c00" }}
                  >
                    Don't have an account? Sign Up
                  </Link>
                </Grid>
              </Grid>
            )}
          </Box>
        </Grid>

        <Snackbar
          open={open}
          autoHideDuration={4000}
          onClose={() => setOpen(false)}
        >
          <Alert
            onClose={() => setOpen(false)}
            severity="success"
            variant="filled"
            sx={{ width: "100%" }}
          >
            {message}
          </Alert>
        </Snackbar>
      </Grid>
    </ThemeProvider>
  );
}
