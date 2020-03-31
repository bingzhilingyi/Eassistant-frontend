/////////---common---/////////
const service_token = 'zdRcLtPlnBTs55KWg9KJqbBHKadYlY';

///////////---dev---///////////
const userServicePath_dev = "http://localhost:8080/qa";
const localhost_dev = "http://localhost:8888";
const servicePaths_dev = () => {
    return {
        service_token, //访问服务的token
        userServicePath: userServicePath_dev, //后台服务地址
        localhost_address: localhost_dev //nodejs服务地址
    }
};
///////////---dev-end---///////////

///////////---sit---///////////
const userServicePath_sit = "";
const localhost_sit = "";
const servicePaths_sit = () => {
    return {
        service_token,
        userServicePath: userServicePath_sit,
        localhost_address: localhost_sit
    }
};
///////////---sit-end---///////////

///////////---pro---///////////
const userServicePath_pro = "";
const localhost_pro = "";
const servicePaths_pro = () => {
    return {
        service_token,
        userServicePath: userServicePath_pro,
        localhost_address: localhost_pro
    }
};
///////////---pro-end---///////////

var servicePaths;
if (process.env.NODE_ENV == 'prod') {
    servicePaths = servicePaths_pro
} else if (process.env.NODE_ENV == 'sit') {
    servicePaths = servicePaths_sit
} else {
    servicePaths = servicePaths_dev
}


export default servicePaths;
