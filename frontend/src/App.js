import React, { useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import 'react-datepicker/dist/react-datepicker.css';
import { Row, Container, Col } from 'react-bootstrap';
import axios from 'axios';
import mqtt from 'mqtt';

import './App.css';
import HeaderAction from '../src/HeaderAction';
import LineChart from './LineChart';
import LineChartRangeTime from './LineChartRangeTime';

const App = () => {
  const [data, setData] = useState([]);
  const [dataRangeTime, setDataRangeTime] = useState([]);

  console.log('Data init: ', data);

  const options = {
    connectTimeout: 4000,

    clientId: 'emqx',

    keepalive: 60,
    clean: true,
    path: '/mqtt',
  };

  // WebSocket connect url
  const WebSocket_URL = 'ws://broker.emqx.io:8083';

  // TCP/TLS connect url
  // const TCP_URL = 'mqtt://broker.emqx.io:1883';
  // const TCP_TLS_URL = 'mqtts://broker.emqx.io:8883';

  const client = mqtt.connect(WebSocket_URL, options);

  // client.on('connect', () => {
  //   console.log('Connect success');
  // });
  client.subscribe('haupc/123', { qos: 1 }, (error) => {
    if (!error) {
      console.log('Subscribe Success');
    }
  });

  client.on('error', (error) => {
    console.log('Connect Error:', error);
  });

  client.on('message', (topic, message) => {
    const rawData = message.toString();
    const jsonData = JSON.parse(rawData);

    setData([...data, jsonData]);

    // disconnect
    // client.end();
  });

  const [isCheck, setCheck] = useState(false);
  const [fromDate, setFromDate] = useState(new Date().setHours(1));
  const [toDate, setToDate] = useState(new Date().setHours(23));

  const handleTimeRange = () => {
    const from = Math.round(new Date(fromDate).getTime() / 1000);
    const to = Math.round(new Date(toDate).getTime() / 1000);

    axios
      .get(`https://btl-backend.herokuapp.com/BTL`, {
        params: {
          startTime: from,
          endTime: to,
        },
      })
      .then(function (response) {
        const { data: resData } = response;
        setDataRangeTime(resData);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      });
  };

  const onChangeFromDate = (date) => {
    setFromDate(date);
  };

  const onChangeToDate = (date) => {
    setToDate(date);
  };

  return (
    <Container fluid className="wrapper-container">
      <Row className="row-first">
        <Col md={12}>
          <Row className="check-group">
            {isCheck ? (
              <i
                className="fas fa-check-square icon-check"
                onClick={() => setCheck(!isCheck)}
              ></i>
            ) : (
              <i
                className="far fa-square icon-check"
                size={30}
                onClick={() => setCheck(!isCheck)}
              ></i>
            )}
            <div>Hiển thị biểu đồ theo thời gian</div>
          </Row>

          <Row>
            {isCheck && (
              <HeaderAction
                fromDate={fromDate}
                toDate={toDate}
                onChangeFromDate={onChangeFromDate}
                onChangeToDate={onChangeToDate}
                handleTimeRange={handleTimeRange}
              />
            )}
          </Row>
        </Col>
      </Row>

      <Row className="row-second">
        {isCheck ? (
          <LineChartRangeTime data={dataRangeTime} />
        ) : (
          <LineChart webSocketData={data} />
        )}
      </Row>
    </Container>
  );
};

export default App;
