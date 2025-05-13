import React, { Component } from "react";
import { Form, Input, Select, Button, message } from "antd";

const { Option } = Select;

export class CreateUser extends Component {
  state = {
    confirmDirty: false,
    autoCompleteResult: [],
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        Meteor.call("create.user", values, (err) => {
          if (err) {
            message.error(err.message);
          } else {
            message.success("User Created!");
            this.props.form.resetFields();
          }
        });
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { xs: { span: 24 }, sm: { span: 8 } },
      wrapperCol: { xs: { span: 24 }, sm: { span: 16 } },
    };
    const tailFormItemLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 16, offset: 8 },
      },
    };

    return (
      <div
        style={{
          margin: "24px 16px",
          padding: 24,
          background: "#fff",
          minHeight: 280,
        }}
      >
        <Form {...formItemLayout} onSubmit={this.handleSubmit}>
          <Form.Item label="Username">
            {getFieldDecorator("username", {
              rules: [
                {
                  required: true,
                  message: "Please input username!",
                  whitespace: true,
                },
              ],
            })(<Input />)}
          </Form.Item>

          <Form.Item label="Password">
            {getFieldDecorator("password", {
              rules: [{ required: true, message: "Please input password!" }],
            })(<Input.Password />)}
          </Form.Item>

          <Form.Item label="Role">
            {getFieldDecorator("role", {
              rules: [{ required: true, message: "Please select a role!" }],
            })(
              <Select placeholder="Select a role">
                <Option value="student">Student</Option>
                <Option value="teacher">Teacher</Option>
              </Select>
            )}
          </Form.Item>

          <Form.Item {...tailFormItemLayout}>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }
}

const WrappedRegistrationForm = Form.create({ name: "createUser" })(CreateUser);

export default WrappedRegistrationForm;
