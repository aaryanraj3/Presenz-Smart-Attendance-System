import React, { Component } from "react";
import { Layout, Menu, Breadcrumb, Icon } from "antd";
const { Header, Content, Footer, Sider } = Layout;
import { withTracker } from "meteor/react-meteor-data";
import { Router } from "@reach/router";

import ViewStudents from "./View/student";
import Dashboard from "./Dashboard";
import Sidebar from "./sidebar";
import CreateClass from "./Create/class";
import CreateUser from "./Create/users";
import ViewClasses from "./View/classes";
import QrCode from "./generateQr";
import ViewUsers from "./View/users";
import Class from "./Class";
import StudentClass from "./Student";
import StudentDashboard from "./StudentDashboard";
import LoginPage from "./Login";

class App extends Component {
  render() {
    const { userId, isTeacher, isStudent } = this.props;

    return (
      <Layout style={{ minHeight: "100vh" }}>
        {userId && <Sidebar />}
        <Layout>
          <Content style={{ margin: 0 }}>
            {!userId ? (
              <Router>
                <LoginPage path="/" default />
              </Router>
            ) : isTeacher ? (
              <Router>
                <Dashboard path="/" default />
                <CreateClass path="/create-class" />
                <ViewClasses path="/view-classes" />
                <ViewStudents path="/view-students" />
                <QrCode path="/qr/:id" />
                <Class path="/class/:id" />
                <StudentClass path="/student/:id" />
              </Router>
            ) : isStudent ? (
              <Router>
                <StudentDashboard path="/student-dashboard" default />
              </Router>
            ) : (
              <Router>
                <CreateUser path="/create-user" />
                <ViewUsers path="/view-users" default />
              </Router>
            )}
          </Content>
          <Footer
            style={{
              textAlign: "center",
              backgroundColor: "black",
              color: "white",
            }}
          >
            Presenz ©2025
          </Footer>
        </Layout>
      </Layout>
    );
  }
}

const AppContainer = withTracker(() => {
  const userId = Meteor.userId();
  return {
    userId,
    isTeacher: Roles.userIsInRole(userId, "teacher"),
    isStudent: Roles.userIsInRole(userId, "student"),
  };
})(App);

export default AppContainer;
