import http from 'k6/http';
import { check, sleep} from 'k6';
http.debug = true;


const DEFAULT_KEY_PATH = './client-key.pem';
const DEFAULT_CERT_PATH = './client.pem';


const ip = 'ip:8883'; 
const keyPath =  DEFAULT_KEY_PATH;
const certPath = DEFAULT_CERT_PATH;

const key = open(keyPath); 
const cert = open(certPath); 


export let options = {
  vus: 30,
  duration: '5m',
  //iterations: 2,
  insecureSkipTLSVerify: true,
  tlsAuth: [
    {
      cert: cert,
      key: key,
    },
  ],
};

let status200 = 0;
let status400 = 0;
let status409 = 0;
let iteration=100;

let data;
let deviceNameCounter = 0;



export default function () {
    const headers = {
        'Content-Type': 'application/json',    
      };
  for (let i = 0; i < iteration; i++) {
    const deviceName = `K61CTEST50G${deviceNameCounter * iteration + i + 1}`;
    const requestBody = {
        deviceName: deviceName,
      };

    const response = http.post(
        `https://${ip}/create-device`, JSON.stringify(requestBody),
        {
          headers: headers,
          timeout: '60s',       
        }
      );

/*       check(response, {
        'Status is 200': (r) => {
          status200++;
          return r.status === 200;
        },
        'Status is 400': (r) => {
          status400++;
          return r.status === 400;
        },
        'Status is 409': (r) => {
          status409++;
          return r.status === 409;
        },
      }); */

      sleep(0.1);
  }
  deviceNameCounter++;

}


