import React, { useState, useEffect } from "react";
import { makeStyles, TextField, Grid } from "@material-ui/core";
import { Formik, Form, FastField, FieldArray } from "formik";
import { isArray } from "lodash";
import NumberFormat from "react-number-format";
import ButtonWithSpinner from "../ButtonWithSpinner";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  fullWidth: {
    width: "100%",
  },
  textfield: {
    width: "100%",
  },
  row: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  control: {
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
  },
  buttonContainer: {
    textAlign: "right",
    padding: theme.spacing(1),
  },
}));

function SchedulesForm(props) {
  const { initialValues, onSubmit, loading, labelSaveButton } = props;
  const classes = useStyles();

  const [schedules, setSchedules] = useState([
    {
      weekday: "Segunda-feira",
      weekdayEn: "monday",
      startTime: "",
      endTime: "",
    },
    {
      weekday: "Terça-feira",
      weekdayEn: "tuesday",
      startTime: "",
      endTime: "",
    },
    {
      weekday: "Quarta-feira",
      weekdayEn: "wednesday",
      startTime: "",
      endTime: "",
    },
    {
      weekday: "Quinta-feira",
      weekdayEn: "thursday",
      startTime: "",
      endTime: "",
    },
    { weekday: "Sexta-feira", weekdayEn: "friday", startTime: "", endTime: "" },
    { weekday: "Sábado", weekdayEn: "saturday", startTime: "", endTime: "" },
    { weekday: "Domingo", weekdayEn: "sunday", startTime: "", endTime: "" },
  ]);

  useEffect(() => {
    if (isArray(initialValues) && initialValues.length > 0) {
      setSchedules(initialValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  const handleSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <Formik
      enableReinitialize
      className={classes.fullWidth}
      initialValues={{ schedules }}
      onSubmit={({ schedules }) =>
        setTimeout(() => {
          handleSubmit(schedules);
        }, 500)
      }
    >
      {({ values }) => (
        <Form className={classes.fullWidth}>
          <FieldArray
            name="schedules"
            render={(arrayHelpers) => (
              <Grid spacing={4} container>
                {values.schedules.map((item, index) => {
                  return (
                    <Grid key={index} xs={12} md={4} item>
                      <Grid container>
                        <Grid className={classes.control} xs={12} item>
                          <FastField
                            as={TextField}
                            label="Dia da Semana"
                            name={`schedules[${index}].weekday`}
                            disabled
                            variant="outlined"
                            className={classes.fullWidth}
                            margin="dense"
                          />
                        </Grid>
                        <Grid className={classes.control} xs={12} md={6} item>
                          <FastField
                            label="Hora de Inicial"
                            name={`schedules[${index}].startTime`}
                          >
                            {({ field }) => (
                              <NumberFormat
                                {...field}
                                variant="outlined"
                                margin="dense"
                                customInput={TextField}
                                format="##:##"
                                className={classes.fullWidth}
                              />
                            )}
                          </FastField>
                        </Grid>
                        <Grid className={classes.control} xs={12} md={6} item>
                          <FastField
                            label="Hora de Final"
                            name={`schedules[${index}].endTime`}
                          >
                            {({ field }) => (
                              <NumberFormat
                                {...field}
                                variant="outlined"
                                margin="dense"
                                customInput={TextField}
                                format="##:##"
                                className={classes.fullWidth}
                              />
                            )}
                          </FastField>
                        </Grid>
                      </Grid>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          ></FieldArray>
          <div className={classes.buttonContainer}>
            <ButtonWithSpinner
              loading={loading}
              type="submit"
              color="primary"
              variant="contained"
            >
              {labelSaveButton ?? "Salvar"}
            </ButtonWithSpinner>
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default SchedulesForm;
