import React, { useState, useCallback}  from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import FormLabel from "@material-ui/core/FormLabel";

import { checkValidity } from '../../shared/validate';
import { updateObject } from '../../shared/utility';
import { buildTextFields } from '../../helpers/uiHelpers';
import { auth } from '../../store/actions/index';
import { addAlert } from '../../store/actions/index';
import * as routez from '../../shared/routes';
import backImg from "../../helpers/images/temp.jpg";

const inputDefinitions = {
    gmail: {
        label: 'Email*',
        validations: {
            required: true,
            isEmail: true,
            validationErrStr: 'Enter a valid email',
        }
    },
    password: {
        label: 'Password*',
        type: 'password',
        validations: {
            required: true,
            minLength: 2,
            maxLength: 40,
            validationErrStr: 'Use between 6 and 40 characters for your password',
        }
    }
};

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100vh',
    },
    image: {
        backgroundImage: `url(${backImg})`,
        backgroundRepeat: 'no-repeat',
        backgroundColor:
            theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width:"100%",
        height:"100%"
    },
    paper: {
        margin: theme.spacing(8, 4),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: "absolute",
        // boxShadow: 5,
        top: "50%",
        left: "20%",
        transform: "translate(-50%, -50%)",
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
        loginInput: {
        width: '100%',
        marginTop: '20px',
        color: 'white'
  },
}));

function SignIn(props) {
    const classes = useStyles();

    const [inputIsValid, setInputIsValid] = useState({
        gmail: true,
        password: true
    });

    const [authObj, setAuthObj] = useState({
        gmail: '',
        password: ''
    });

    const inputProperties = {
        gmail: {
            styleClass: classes.loginInput
        },
        password: {
            styleClass: classes.loginInput
        }
    };

    const parseErrorMessage = (errorMessage) => {
        switch (errorMessage) {
            case "User doesn't exist":
                return "Hmm... We couldn't find an account for this email";
            case "Invalid username/password supplied":
                return "Hmm... Seems like the username/password is wrong.";
            case "Invalid Username or Password":
                return "Hmm... Seems like the username/password is wrong.";
            case "Server is under maintainance. Try again shortly.":
                return "Server is under maintainance. Try again shortly.";
            default:
                return null;
        }
    };

    const checkInputValidity = useCallback((inputId, newValue) => {
        let isValid = true;
        let validationConst = inputDefinitions[inputId].validations;
        isValid = checkValidity(validationConst, newValue ? newValue : authObj[inputId])

        return isValid;
    }, [authObj])

    const inputChangeHandler = useCallback((event, inputId) => {
        let validationConst = inputDefinitions[inputId].validations;
        let isValid = checkValidity(validationConst, event.target.value);
        setInputIsValid(updateObject(inputIsValid, { [inputId]: isValid }));
        setAuthObj(updateObject(authObj, { [inputId]: event.target.value }))
    }, [authObj, inputIsValid]);

    let inputFields = buildTextFields(inputDefinitions, inputProperties, inputChangeHandler, inputIsValid);

    const onSubmitHandler = useCallback((event) => {
        event.preventDefault()

        let localInputIsValid = { ...inputIsValid };
        localInputIsValid['gmail'] = checkInputValidity('gmail');
        localInputIsValid['password'] = checkInputValidity('password');
        setInputIsValid(localInputIsValid);

        if (localInputIsValid['gmail'] && localInputIsValid['password']) {
            props.onAuth(
                authObj.gmail,
                authObj.password
            );
        }
    }, [authObj, checkInputValidity, inputIsValid, props]);

    // const authError = props.error;
    // useEffect(() => {
    //     if (authError) {
    //         alert(authError)
    //     }
    // }, [authError,history]);

    let authRedirect = null;
    if (props.isAuthenticated) {
        if(props.usertype.toUpperCase()==="ADMIN" ){
            authRedirect = <Redirect to={routez.COMPANIES} />
        }else if(props.usertype.toUpperCase()==="PANEL" ){
            authRedirect = <Redirect to={routez.INTERVIEPANNEL} />
        }else if(props.usertype.toUpperCase()==="VOLUNTEER" ){
            authRedirect = <Redirect to={routez.INTERVIEWEE} />
        }
        
    }

    let errorMessage = null;
	if (props.error) {
		errorMessage = (
			<div className={classes.errorLabel}>
				<FormLabel error={true}>{parseErrorMessage(props.error)}</FormLabel>
			</div>
		);
	}

  return (
    <Grid container component="main" className={classes.root}>
        <CssBaseline />
        <Grid item xs={12} sm={12} md={12} component={Paper} elevation={6} square className={classes.image} >
            <div className={classes.paper}>
                {/* <Avatar className={classes.avatar}>
                    <LockOutlinedIcon />
                </Avatar> */}
                <Typography component="h1" variant="h5">
                    Sign in
                </Typography>
                <form noValidate autoComplete="off" className={classes.form} onSubmit={onSubmitHandler}>
                    {errorMessage}
                    {inputFields}
                    <Button
                        type="submit"
                        // fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                    >
                        Sign In
                    </Button>
                </form>
            </div>
            {authRedirect}
        </Grid>
    </Grid>
  );
}

const mapStateToProps = (state) => {
    return {
        error: state.auth.error,
        loading: state.auth.loading,
        isAuthenticated: state.auth.token != null,
        authRedirectPath: state.auth.authRedirectPath,
        usertype:state.auth.usertype,
        stationID:state.auth.stationID,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onAuth: (gmail, password) => dispatch(auth(gmail, password)),
        addAlert: (alert) => dispatch(addAlert(alert))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(SignIn);