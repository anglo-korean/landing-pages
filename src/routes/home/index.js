import {
    h,
} from 'preact';

import { useState, useEffect } from "preact/hooks";

import Cookies from 'universal-cookie';

import {
    Grid,
} from '@material-ui/core';

import style from './style.css';
import config from '../../config/lander';
import {
    signup,
    initiate,
} from '../../lib/submitter';

const re = "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$";

const cookieName = "AnkoID";

const Home = (props, state) => {
    const defaultCampaign = config.campaigns[config.defaultCampaign];

    const campaign = props.matches.c ?
          config.campaigns[props.matches.c] || defaultCampaign :
          defaultCampaign;

    const [waitlist,setWaitlist] = useState("Join the waitlist today");
    const [addr, setAddr] = useState("");
    const [userID, setUserID] = useState("");

    const onSubmit = e => {
        setWaitlist("Joining waitlist...");

        signup({
            id: userID,
            addr: addr,
            campaign: props.matches.c,
        })
            .then(function() {
                setWaitlist("Congratulations on joining the waitlist");
                setAddr("");
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

    // After Home renders, get an ID
    useEffect(() => {
        const cookies = new Cookies();
        let idCookie = cookies.get(cookieName);

        // Check whether idCookie is truthy, or whether it has been
        // persisted as the string 'undefined', which means that somehow
        // we've taken an undefined values, stringified it, and saved as
        // a cookie
        if (!idCookie || idCookie == 'undefined') {
            initiate()
                .then(function(resp) {
                    // initiate _does_ set a cookie, but against the
                    // digitalocean functions domain.
                    //
                    // This would be fine if the signup call had access
                    // to that cookie, but it doesn't always (and, so, we
                    // can't guarantee it'll be there).
                    //
                    // Thus, we must also set one here against the correct
                    // domain.
                    //
                    // I know... nightmare
                    idCookie = resp.data;
                    cookies.set(cookieName, idCookie, {
                        path: '/',
                        maxAge: 7890000, // 3 months
                        sameSite: 'strict',
                    });

                    setUserID(idCookie);
                })
        } else {
            // Re-setting the cookie should reset the maxAge
            if (idCookie) {
                cookies.set(cookieName, idCookie, {
                    path: '/',
                    maxAge: 7890000, // 3 months
                    sameSite: 'strict',
                });

                setUserID(idCookie);
            }
        }
    }, [])

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
                    <strong className={style.waitlist}>
                      {waitlist}
                    </strong>
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
