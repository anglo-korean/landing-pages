import {
    h,
} from 'preact';

import { useState, useCallback } from "preact/hooks";

import {
    Grid,
} from '@material-ui/core';

import style from './style.css';
import {Logo} from './logo';
import config from '../../config/lander';
import {signup} from '../../lib/submitter';

const re = "/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;";

const Home = (props, state) => {
    const defaultCampaign = config.campaigns[config.defaultCampaign];

    const campaign = props.matches.c ?
          config.campaigns[props.matches.c] || defaultCampaign :
          defaultCampaign;

    const [waitlist,setWaitlist] = useState("Join the waitlist today");
    const [addr, setAddr] = useState("");

    const onSubmit = e => {
        signup({
            addr: addr,
            campaign: props.matches.c,
        })
            .then(function() {
                setWaitlist("Congratulations on joining the waitlist");
                setAddr = "";
            })
            .catch(function (error) {
                setWaitlist("There was an error joining the waitlist. Please try again later");
                console.log(error);
            });

        e.preventDefault();
    };

    const onInput = e => {
        const { value } = e.target;
        setAddr(value);
    };

    return (
        <>
          <div className={style.landingWrapper}>
            <div className="App">
              <Grid container className={style.landing} style={{"marginBottom":"64px"}}>
                <Grid item sm={false} lg={2}> </Grid>

                <Grid item sm={12} lg={8} className={style.hero}>
                  <Grid item sm={12} md={6}>
                    <h1 className={style.huge}>{campaign.headline}</h1>
                  </Grid>
                </Grid>
                <Grid item sm={false} lg={2}> </Grid>

                <Grid item sm={false} lg={3}> </Grid>
                <Grid item sm={12} lg={6} className={style.tagline}>
                  <p>
                    {campaign.tagline}
                  </p>

                  <p>
                    {waitlist}
                  </p>

                  <div className={style.signup}>
                    <form onSubmit={onSubmit}>
                      <button type="submit" role="button">{campaign.cta}</button>
                      <div className={style.inputDiv}>
                        <input type="email"
                               placeholder={campaign.hint}
                               pattern={re}
                               value={addr}
                               onInput={onInput}
                               required />
                      </div>
                    </form>
                  </div>
                </Grid>
              </Grid>
            </div>
          </div>
        </>
    );
};

export default Home;
