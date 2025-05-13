import React, { useEffect, useState } from "react";
import { Meteor } from "meteor/meteor";
import { Layout } from "antd";
const { Header, Content } = Layout;

import {
  Table,
  message,
  Button,
  Card,
  Row,
  Col,
  Modal,
  Input,
  Form,
} from "antd";
import moment from "moment";
import { Html5Qrcode } from "html5-qrcode";

export default function StudentDashboard() {
  const [records, setRecords] = useState([]);
  const [classDetails, setClassDetails] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [scanner, setScanner] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fetchAttendance = () => {
    const studentId = Meteor.userId();
    Meteor.call("attendance.getStudentDetails", studentId, (err, res) => {
      if (err) {
        message.error("Failed to fetch attendance.");
      } else {
        setRecords(res.attendanceRecords);
        setClassDetails(res.classDetails);
      }
    });
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  useEffect(() => {
    if (scanning) {
      const html5QrCode = new Html5Qrcode("qr-reader");

      html5QrCode
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            html5QrCode
              .stop()
              .then(() => {
                setScanning(false);
                try {
                  const url = new URL(decodedText);
                  const parts = url.pathname.split("/");
                  const classId = parts[2];
                  const day = parts[4];
                  const counter = parts[6];

                  if (!classId || !day || !counter) {
                    message.error("Invalid QR code structure.");
                    return;
                  }

                  const data = {
                    classId,
                    day,
                    counter,
                    studentId: Meteor.userId(),
                  };

                  Meteor.call("attendance.mark", data, (err, res) => {
                    if (err) {
                      message.warning("Attendance not marked: " + err.reason);
                    } else {
                      message.info(res.msg);
                      if (res.status) fetchAttendance();
                    }
                  });
                } catch (e) {
                  console.error("QR parsing failed:", e);
                  message.error("Invalid QR code format.");
                }
              })
              .catch((error) => {
                console.error("Failed to stop scanner:", error);
              });
          },
          (errorMessage) => {
            console.warn("QR Scan error:", errorMessage);
          }
        )
        .then(() => {
          setScanner(html5QrCode);

          setTimeout(() => {
            const video = document.querySelector("#qr-reader video");
            if (video) {
              video.style.borderRadius = "16px";
            }
          }, 500);
        })
        .catch((err) => {
          console.error("Scanner start error:", err);
          message.error("Unable to start QR scanner");
          setScanning(false);
        });
    }

    return () => {
      if (scanner) {
        scanner
          .stop()
          .then(() => scanner.clear())
          .catch((err) => console.error("Error clearing scanner:", err));
      }
    };
  }, [scanning]);

  const handlePasswordChange = () => {
    if (password !== confirmPassword) {
      message.error("Passwords do not match.");
      return;
    }

    const userId = Meteor.userId();

    Meteor.call("reset.password", { userId, newPassword: password }, (err) => {
      if (err) {
        message.error("Failed to change password.");
      } else {
        message.success("Password changed successfully!");
        setShowPasswordModal(false);
        setPassword("");
        setConfirmPassword("");
      }
    });
  };

  const handleLogout = () => {
    Meteor.logout(() => {
      message.info("Logged out successfully");
      window.location.reload();
    });
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      render: (text) => moment(text).format("LL"),
    },
    {
      title: "Time",
      dataIndex: "timestamp",
      render: (text) => moment(text).format("hh:mm A"),
    },
  ];

  const email = Meteor.user()?.emails?.[0]?.address ?? "Student";
  const username = Meteor.user()?.username || "Student";
  const capitalizedUsername =
    username.charAt(0).toUpperCase() + username.slice(1);

  return (
    <Layout
      style={{
        minHeight: "100vh",
        backgroundColor: "#121212",
        color: "#ffffff",
      }}
    >
      <Header
        style={{
          backgroundColor: "#1e1e1e",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.5)",
        }}
      >
        <img
          src="/presenz_logo.png"
          alt="Presenz Logo"
          style={{ height: "40px", marginRight: "15px", borderRadius: "50%" }}
        />
        <h2 style={{ color: "#ffffff", margin: 0 }}>Presenz</h2>
      </Header>

      <Content
        style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{ fontSize: "28px", color: "#e0e0e0" }}>
            Welcome, <strong>{capitalizedUsername}</strong>
          </h1>
        </div>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          {!scanning ? (
            <Button
              onClick={() => setScanning(true)}
              type="primary"
              size="large"
              style={{
                backgroundColor: "#00C853",
                borderColor: "#00C853",
                color: "#fff",
                fontWeight: "bold",
                borderRadius: "10px",
                boxShadow: "0 4px 12px rgba(0, 200, 83, 0.4)",
              }}
            >
              Scan QR Code
            </Button>
          ) : (
            <div style={{ marginTop: 20 }}>
              <div
                id="qr-reader"
                style={{
                  width: "300px",
                  margin: "0 auto",

                  borderRadius: "16px",
                  backgroundColor: "#1E1E1E",
                  border: "3px solid #fff",
                }}
              />
              <Button
                danger
                size="large"
                style={{
                  marginTop: 15,
                  backgroundColor: "#D32F2F",
                  color: "#fff",
                  borderRadius: "10px",
                  fontWeight: "600",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(211, 47, 47, 0.4)",
                }}
                onClick={() => {
                  if (scanner) {
                    scanner
                      .stop()
                      .then(() => {
                        scanner.clear();
                        setScanning(false);
                      })
                      .catch((err) => {
                        console.error("Error stopping scanner:", err);
                        setScanning(false);
                      });
                  } else {
                    setScanning(false);
                  }
                }}
              >
                Stop Scanning
              </Button>
            </div>
          )}
        </div>

        <Row gutter={[16, 24]} style={{ marginTop: "30px" }}>
          <Col span={24}>
            <h3
              style={{
                fontSize: "20px",
                color: "#ffffff",
                marginBottom: "10px",
              }}
            >
              Class-wise Attendance
            </h3>
            <Row gutter={[16, 16]}>
              {classDetails.length > 0 ? (
                classDetails.map((classDetail) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={classDetail.classId}>
                    <Card
                      title={
                        <span style={{ color: "#ffffff" }}>
                          Class: {classDetail.className}
                        </span>
                      }
                      bordered={false}
                      style={{
                        backgroundColor: "#1f1f1f",
                        color: "#ffffff",
                        borderRadius: "12px",
                        boxShadow: "0 4px 10px rgba(255, 255, 255, 0.05)",
                        marginBottom: "20px",
                      }}
                    >
                      <p>Total Classes: {classDetail.totalClasses}</p>
                      <p>Attended Classes: {classDetail.attendedClasses}</p>
                      <p>
                        Attendance Percentage:{" "}
                        {classDetail.attendancePercentage}%
                      </p>
                    </Card>
                  </Col>
                ))
              ) : (
                <p style={{ color: "#ccc" }}>No class details available</p>
              )}
            </Row>
          </Col>
          <Col span={24}>
            <h3
              style={{
                fontSize: "20px",
                color: "#ffffff",
                marginBottom: "10px",
              }}
            >
              Your Attendance History
            </h3>
            <Table
              dataSource={records}
              columns={columns}
              rowKey="_id"
              pagination={{ pageSize: 5 }}
              bordered
              style={{
                backgroundColor: "#DBDBDB",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            />
          </Col>
        </Row>

        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <Button
            onClick={handleLogout}
            size="large"
            style={{
              marginRight: "10px",
              borderRadius: "10px",
              backgroundColor: "#D32F2F",
              color: "#fff",
              fontWeight: "bold",
              boxShadow: "0 4px 12px rgba(211, 47, 47, 0.4)",
              border: "none",
            }}
          >
            Log Out
          </Button>

          <Button
            onClick={() => setShowPasswordModal(true)}
            size="large"
            style={{
              borderRadius: "10px",
              backgroundColor: "#1976D2",
              color: "#fff",
              fontWeight: "bold",
              boxShadow: "0 4px 12px rgba(25, 118, 210, 0.4)",
              border: "none",
            }}
          >
            Change Password
          </Button>
        </div>

        <Modal
          title={
            <span style={{ color: "#333", fontWeight: "bold" }}>
              Change Password
            </span>
          }
          visible={showPasswordModal}
          onCancel={() => setShowPasswordModal(false)}
          footer={[
            <Button
              key="cancel"
              onClick={() => setShowPasswordModal(false)}
              style={{
                borderRadius: "8px",
                backgroundColor: "#555",
                color: "#fff",
                fontWeight: "bold",
                border: "none",
              }}
            >
              Cancel
            </Button>,
            <Button
              key="submit"
              onClick={handlePasswordChange}
              style={{
                borderRadius: "8px",
                backgroundColor: "#00C853",
                color: "#fff",
                fontWeight: "bold",
                border: "none",
                boxShadow: "0 4px 12px rgba(0, 200, 83, 0.4)",
              }}
            >
              Change Password
            </Button>,
          ]}
          bodyStyle={{
            backgroundColor: "#1e1e1e",
            color: "#ffffff",
            paddingTop: "20px",
          }}
        >
          <Form layout="vertical">
            <Form.Item
              label={<span style={{ color: "#ccc" }}>New Password</span>}
              required
            >
              <Input.Password
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  backgroundColor: "#2a2a2a",
                  border: "1px solid #444",
                  color: "#fff",
                }}
              />
            </Form.Item>
            <Form.Item
              label={<span style={{ color: "#ccc" }}>Confirm Password</span>}
              required
            >
              <Input.Password
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  backgroundColor: "#2a2a2a",
                  border: "1px solid #444",
                  color: "#fff",
                }}
              />
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
}
