///////////---dev---///////////
const userServicePath_dev = "http://localhost:8080/qa";
//const userServicePath_dev = "http://10.61.16.29:8522/qa";
const servicePaths_dev = () => {
    return {
        userServicePath: userServicePath_dev
    }
};
///////////---dev-end---///////////

///////////---pro---///////////
const userServicePath_pro = "http://10.61.16.29:8522/qa";

const servicePaths_pro = () => {
    return {
        userServicePath: userServicePath_pro
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