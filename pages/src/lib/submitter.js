import axios from 'redaxios';

const signupAddr = "http://localhost:8008";

export const  signup = async({addr, campaign}) => {
    return axios({
        method: 'post',
        url: signupAddr,
        data: {addr, campaign},
    });
};
