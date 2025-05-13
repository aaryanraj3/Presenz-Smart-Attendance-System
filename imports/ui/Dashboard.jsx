import React, { Component } from "react";
import { Classe } from "../api/classes";
import { Student } from "../api/student";
import { withTracker } from "meteor/react-meteor-data";
import {
  MDBCard,
  MDBCardBody,
  MDBCol,
  MDBCardTitle,
  MDBCardText,
  MDBCardHeader,
  MDBBtn,
  MDBContainer,
  MDBRow,
} from "mdbreact";
import { Card, Icon, Avatar, List, Select } from "antd";
const { Meta } = Card;
import Calendar from "./Calender";

export class Dashboard extends Component {
  state = {
    dangerZone: [],
    dates: [],
    classId: "",
  };

  componentDidMount() {
    Meteor.call("danger.zone", (err, res) => {
      if (err) {
        console.log(err);
      } else {
        this.setState({ dangerZone: res });
      }
    });
  }

  getDates = (r) => {
    Meteor.call("get.attedance.dates", r, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        this.setState({ dates: res });
      }
    });
  };

  sendWarningEmail = (studentId, classId, absence) => {
    const student = Student.findOne({ _id: studentId });
    const classData = Classe.findOne({ _id: classId });

    Meteor.call(
      "sendLowAttendanceEmail",
      {
        email: student.email,
        name: student.username,
        absenceCount: absence,
        className: classData.name,
      },
      (err) => {
        if (err) {
          alert("Error sending email: " + err.message);
        } else {
          alert("Email sent to " + student.username);
        }
      }
    );
  };

  render() {
    const { user, studentCounter, classCounter, classes } = this.props;
    const { dangerZone, dates, classId } = this.state;

    return (
      <MDBContainer fluid>
        <MDBRow className="mb-4">
          <MDBCol md="12">
            <MDBCard className="shadow-sm p-3" style={{ borderRadius: "15px" }}>
              <MDBCardBody>
                <MDBRow>
                  <MDBCol md="6">
                    <h3>
                      Welcome, <strong>{user ? user.username : "NA"}</strong>
                    </h3>
                    <p className="text-muted">
                      Your dashboard summary is below:
                    </p>
                  </MDBCol>
                  <MDBCol md="3" className="text-center">
                    <h4>{studentCounter ?? "NU"}</h4>
                    <Icon
                      type="user"
                      style={{ color: "#3f51b5", fontSize: "28px" }}
                    />
                    <p className="text-muted">Students</p>
                  </MDBCol>
                  <MDBCol md="3" className="text-center">
                    <h4>{classCounter ?? "NU"}</h4>
                    <Icon
                      type="book"
                      style={{ color: "#009688", fontSize: "28px" }}
                    />
                    <p className="text-muted">Classes</p>
                  </MDBCol>
                </MDBRow>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>

        <MDBRow className="mb-4">
          {[
            {
              href: "/view-classes",
              icon: "book",
              title: "Manage Classes",
              color: "#4caf50",
            },
            {
              href: "/view-students",
              icon: "user-add",
              title: "Manage Students",
              color: "#2196f3",
            },
          ].map((item, idx) => (
            <MDBCol md="3" key={idx} className="mb-3">
              <a href={item.href ?? "#"} style={{ textDecoration: "none" }}>
                <Card
                  className="shadow-sm"
                  style={{
                    borderRadius: "12px",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  <Meta
                    avatar={
                      <Icon
                        type={item.icon}
                        style={{ fontSize: "25px", color: item.color }}
                      />
                    }
                    title={
                      <span style={{ color: "#212121" }}>{item.title}</span>
                    }
                  />
                </Card>
              </a>
            </MDBCol>
          ))}
        </MDBRow>

        <MDBRow>
          <MDBCol md="6" className="mb-4">
            <MDBCard style={{ borderRadius: "12px" }} className="shadow-sm">
              <MDBCardHeader
                className="font-weight-bold"
                style={{ color: "#D32F2F" }}
              >
                ⚠️ Danger Zone Students
              </MDBCardHeader>
              <MDBCardBody>
                <p className="text-muted mb-3">
                  These students have attended less than 50% of their classes.
                </p>
                <List
                  itemLayout="horizontal"
                  dataSource={dangerZone}
                  renderItem={(a) => {
                    const student = Student.findOne({ _id: a.studentId });
                    const classData = Classe.findOne({ _id: a.classId });

                    return (
                      <List.Item
                        actions={[
                          <MDBBtn
                            size="sm"
                            color="danger"
                            onClick={() =>
                              this.sendWarningEmail(
                                a.studentId,
                                a.classId,
                                a.absence
                              )
                            }
                          >
                            Send Warning
                          </MDBBtn>,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<Avatar icon="user" />}
                          title={
                            <strong style={{ color: "#212121" }}>
                              {student?.username ?? "N/A"}
                            </strong>
                          }
                          description={`Absent ${a.absence} times in ${
                            classData?.name ?? "N/A"
                          }`}
                        />
                      </List.Item>
                    );
                  }}
                />
              </MDBCardBody>
            </MDBCard>
          </MDBCol>

          <MDBCol md="6" className="mb-4">
            <MDBCard style={{ borderRadius: "12px" }} className="shadow-sm">
              <MDBCardHeader
                className="font-weight-bold"
                style={{ color: "#673ab7" }}
              >
                📅 Attendance Calendar
                <Select
                  placeholder="Select Class"
                  style={{ width: "200px", float: "right" }}
                  onChange={(r) => {
                    this.setState({ classId: r });
                    this.getDates(r);
                  }}
                >
                  {classes &&
                    classes.map((a) => (
                      <Select.Option key={a._id} value={a._id}>
                        {a.name}
                      </Select.Option>
                    ))}
                </Select>
              </MDBCardHeader>
              <MDBCardBody style={{ textAlign: "center" }}>
                <Calendar dates={dates} />
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    );
  }
}

const ViewArticlesWrapper = withTracker((props) => {
  const status = Meteor.subscribe("get.students");
  const status2 = Meteor.subscribe("get.classes");
  const status3 = Meteor.subscribe("get.users");
  const user = Meteor.users.findOne({ _id: Meteor.userId() });
  const classCounter = Classe.find({ teacherId: Meteor.userId() }).count();
  const studentCounter = Student.find({ createdBy: Meteor.userId() }).count();
  const classes = Classe.find({ teacherId: Meteor.userId() }).fetch();
  const ready = status.ready();
  return {
    ready,
    user,
    classCounter,
    studentCounter,
    classes,
    ...props,
  };
})(Dashboard);

export default ViewArticlesWrapper;
