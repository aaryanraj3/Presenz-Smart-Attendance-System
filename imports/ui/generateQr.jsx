import React, { Component } from "react";
import QRCode from "qrcode.react";
import { Rnd } from "react-rnd";
import { Card, Spin } from "antd";

class QrCode extends Component {
  state = {
    url: null,
    loading: true,
  };

  componentDidMount() {
    const { id } = this.props;

    Meteor.call("mobile.qr", id, (err, res) => {
      if (err) {
        console.error("Error calling mobile.qr:", err);
      } else {
        this.setState({ url: res, loading: false });
      }
    });
  }

  render() {
    const { loading, url } = this.state;

    return (
      <Card style={{ backgroundColor: "white" }} loading={loading}>
        <Rnd
          default={{
            x: 300,
            y: 100,
            width: 300,
            height: 300,
          }}
          bounds="window"
        >
          {url ? (
            <QRCode value={url} style={{ width: "100%", height: "auto" }} />
          ) : (
            <Spin />
          )}
        </Rnd>
      </Card>
    );
  }
}

export default QrCode;
