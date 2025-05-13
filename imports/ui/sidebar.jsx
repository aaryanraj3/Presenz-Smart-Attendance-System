import React, { Component } from "react";
import { Menu, Icon, Button, Layout, Avatar } from "antd";
import { withTracker } from "meteor/react-meteor-data";
import { Link } from "@reach/router";
import { Roles } from "meteor/alanning:roles";
import "antd/dist/antd.css";

const SubMenu = Menu.SubMenu;
const { Sider } = Layout;

class Sidebar extends Component {
  state = {
    collapsed: false,
  };

  handleCollapse = (collapsed) => {
    this.setState({ collapsed });
  };

  render() {
    const { user } = this.props;
    const { collapsed } = this.state;

    const isTeacher = Roles.userIsInRole(Meteor.userId(), "teacher");
    const isStudentDashboard = Roles.userIsInRole(Meteor.userId(), "student");

    if (isStudentDashboard) {
      return null;
    }

    return (
      <Sider
        collapsible
        theme="dark"
        width={250}
        collapsed={collapsed}
        onCollapse={this.handleCollapse}
      >
        <div className={`top-logo-section ${collapsed ? "collapsed" : ""}`}>
          <img
            src="/presenz_logo.png"
            alt="Presenz Logo"
            className="sidebar-logo"
          />
          {!collapsed && <h1 className="sidebar-title">Presenz</h1>}
        </div>

        {isTeacher ? (
          <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline">
            <div
              className={`sidebar-section sidebar-user ${
                collapsed ? "collapsed" : ""
              }`}
            >
              <div className="sidebar-user-avatar">
                <Avatar
                  style={{ backgroundColor: "#87d068" }}
                  size="large"
                  icon="user"
                />
                {!collapsed && (
                  <span className="username">
                    {user ? user.username : "NA"}
                  </span>
                )}
              </div>
            </div>
            <Menu.Item key="1">
              <Link to="/">
                <Icon type="home" />
                Home
              </Link>
            </Menu.Item>

            <SubMenu
              key="sub2"
              title={
                <span>
                  <Icon type="book" />
                  <span>Classes</span>
                </span>
              }
            >
              <Menu.Item key="6">
                <Link to="create-class">
                  <Icon type="edit" />
                  Create Class
                </Link>
              </Menu.Item>
              <Menu.Item key="8">
                <Link to="/view-classes">
                  <Icon type="diff" />
                  View Classes
                </Link>
              </Menu.Item>
            </SubMenu>

            <Menu.Item key="11">
              <Link to="/view-students">
                <Icon type="usergroup-add" />
                View Students
              </Link>
            </Menu.Item>

            <Menu.Item>
              <Button
                type="primary"
                block
                onClick={() => {
                  Meteor.logout();
                  location.reload();
                }}
              >
                Log Out
              </Button>
            </Menu.Item>
          </Menu>
        ) : (
          <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline">
            <SubMenu
              key="sub1"
              title={
                <span>
                  <Icon type="user" />
                  <span>Users</span>
                </span>
              }
            >
              <Menu.Item key="1">
                <Link to="create-user">Create User</Link>
              </Menu.Item>
              <Menu.Item key="2">
                <Link to="view-users">View Users</Link>
              </Menu.Item>
            </SubMenu>

            <Menu.Item>
              <Button
                type="primary"
                block
                onClick={() => {
                  Meteor.logout();
                  location.reload();
                }}
              >
                Log Out
              </Button>
            </Menu.Item>
          </Menu>
        )}

        <style jsx>{`
          .top-logo-section {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            padding: 16px 0;
            border-bottom: 1px solid #333;
            gap: 12px;
          }

          .top-logo-section.collapsed {
            justify-content: center;
          }

          .sidebar-logo {
            width: 40px;
            height: 40px;
            border-radius: 50%;
          }

          .sidebar-title {
            color: white;
            font-size: 20px;
            font-weight: bold;
            margin: 0;
          }

          .sidebar-section {
            padding: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: row;
            border-bottom: 1px solid #333;
            gap: 10px;
          }

          .sidebar-section.collapsed {
            justify-content: center;
          }

          .sidebar-user-avatar {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .username {
            font-weight: bold;
            color: white;
            font-size: 16px;
            margin: 0;
            white-space: nowrap;
          }

          .ant-menu-item {
            font-size: 16px;
          }

          .ant-menu-item:hover {
            background-color: #1890ff;
          }

          .ant-menu-item-selected {
            background-color: #1890ff !important;
          }

          .ant-btn-primary {
            background-color: #ff4d4f;
            border-color: #ff4d4f;
          }

          .ant-btn-primary:hover {
            background-color: #ff7875;
            border-color: #ff7875;
          }

          .ant-avatar {
            background-color: #87d068;
          }
        `}</style>
      </Sider>
    );
  }
}

const ListPageContainer = withTracker(() => {
  const status = Meteor.subscribe("_roles");
  const status2 = Meteor.subscribe("get.users");
  const user = Meteor.users.findOne({ _id: Meteor.userId() });
  const ready = status.ready();
  return {
    ready,
    user,
  };
})(Sidebar);

export default ListPageContainer;
