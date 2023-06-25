import axios from 'redaxios';

const signupsAddr = "https://faas-lon1-917a94a7.doserverless.co/api/v1/web/fn-a558965b-aa27-4890-9eec-0b659e229e39/lander/signups";
const initAddr = "https://faas-lon1-917a94a7.doserverless.co/api/v1/web/fn-a558965b-aa27-4890-9eec-0b659e229e39/lander/initialiser";

export const signup = async({id, addr, campaign}) => {
    const fd = new FormData();
    fd.append('addr', addr);
    fd.append('campaign', campaign || 'default');

    return axios({
        method: 'post',
        url: signupsAddr,
        data: {addr, campaign},
        headers: {
            'x-anko-id': id,
        },
    });
};

export const initiate = async() => {
    return axios({
        method: 'get',
        url: initAddr,
    });
};
