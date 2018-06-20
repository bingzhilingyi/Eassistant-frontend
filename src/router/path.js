///////////---dev---///////////
const userServicePath_dev = "http://localhost:8080/qa";
//const userServicePath_dev = "http://10.61.16.29:8522/qa";
const localhost_dev = "http://localhost:8888";
const servicePaths_dev = () => {
    return {
        userServicePath: userServicePath_dev,
        localhost_address: localhost_dev
    }
};
///////////---dev-end---///////////

///////////---pro---///////////
const userServicePath_pro = "http://10.61.16.29:8522/qa";
const localhost_pro = "http://10.61.16.29:8523";
const servicePaths_pro = () => {
    return {
        userServicePath: userServicePath_pro,
        localhost_address: localhost_pro
    }
};
///////////---pro-end---///////////

var servicePaths;
if (process.env.NODE_ENV === 'development') {
    servicePaths = servicePaths_dev
} else {
    servicePaths = servicePaths_pro
}


export default servicePaths;