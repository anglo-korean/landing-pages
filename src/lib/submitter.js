import axios from 'redaxios';

const landerAddr = "https://faas-lon1-917a94a7.doserverless.co/api/v1/web/fn-a558965b-aa27-4890-9eec-0b659e229e39/lander/signups"

export const  signup = async({addr, campaign}) => {
    const fd = new FormData();
    fd.append('addr', addr);
    fd.append('campaign', campaign || 'default');

    return axios({
        method: 'post',
        url: landerAddr,
        data: {addr, campaign},
    });
};
