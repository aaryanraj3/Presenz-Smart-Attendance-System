import React from "react";
import { message, Alert } from "antd";
import Login from "ant-design-pro/lib/Login";
import { Meteor } from "meteor/meteor";
import { navigate } from "@reach/router";
import { Tracker } from "meteor/tracker";

const { UserName, Password, Submit } = Login;

class LoginPage extends React.Component {
  state = {
    notice: "",
    type: "tab2",
    loading: false,
  };

  onSubmit = (err, values) => {
    if (!err) {
      const { username, password } = values;
      this.setState({ loading: true, notice: null });

      Meteor.loginWithPassword(username, password, (err) => {
        if (err) {
          console.log(err);
          message.error(err.reason);
          this.setState({ loading: false });
        } else {
          Tracker.autorun(() => {
            const user = Meteor.user();

            if (user) {
              if (user.roles?.includes("student")) {
                Meteor.call("attendance.mark", (err) => {
                  this.setState({ loading: false });
                  navigate("/student-dashboard");
                });
                location.reload();
              } else {
                this.setState({ loading: false });
                location.reload();
              }
            }
          });
        }
      });
    }
  };

  render() {
    return (
      <div className="loginContainer" style={styles.container}>
        <div style={styles.mainLoginManagement}>
          <div style={styles.loginBox}>
            <h1 style={styles.header}>
              <img src="/presenz_logo.png" style={styles.logo} /> Presenz
            </h1>

            <Login
              defaultActiveKey={this.state.type}
              onTabChange={this.onTabChange}
              onSubmit={this.onSubmit}
            >
              {this.state.notice && (
                <Alert
                  style={styles.noticeAlert}
                  message={this.state.notice}
                  type="error"
                  showIcon
                  closable
                />
              )}
              <UserName
                name="username"
                placeholder="Username"
                style={styles.inputField}
              />
              <Password
                name="password"
                placeholder="Password"
                style={styles.inputField}
              />

              <Submit style={styles.submitButton} loading={this.state.loading}>
                Login
              </Submit>
            </Login>
          </div>
        </div>
      </div>
    );
  }
}

const styles = {
  container: {
    backgroundColor: "#2C2F33",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  mainLoginManagement: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    textAlign: "center",
  },
  loginBox: {
    backgroundColor: "#23272A",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
    width: "100%",
    maxWidth: "400px",
    color: "#FFF",
  },
  header: {
    color: "#FFF",
    marginBottom: "20px",
    fontSize: "24px",
    fontWeight: "600",
  },
  logo: {
    width: "40px",
    marginRight: "10px",
    borderRadius: "50%",
  },
  inputField: {
    borderRadius: "8px",
    backgroundColor: "#444851",
    color: "#FFF",
    marginBottom: "15px",
    padding: "10px",
    border: "none",
    width: "100%",
  },
  submitButton: {
    width: "100%",
    backgroundColor: "#7289DA",
    borderRadius: "8px",
    border: "none",
    padding: "10px",
    color: "#FFF",
    fontSize: "16px",
    fontWeight: "600",
    marginTop: "10px",
  },
  noticeAlert: {
    marginBottom: "24px",
    backgroundColor: "#F44336",
    color: "#FFF",
  },
};

export default LoginPage;
