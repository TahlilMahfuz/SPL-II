import React from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { NavLink } from 'react-router-dom'


const Login = () => {


    return (
        <>
        <div>
            <div className="row">
                <div className="mx-auto col-10 col-md-8 col-lg-6">
            <div className="container mt-3">
                <section className='d-flex justify-content-between'>
                    <div className="left_data mt-3 p-3" style={{ width: "100%" }}>
                        <h3 className='text-center col-lg-6'>Log In</h3>
                        <Form >

                            <Form.Group className="mb-3 col-lg-6" controlId="formBasicEmail">

                                <Form.Control type="email" name='email' placeholder="Enter email" />
                            </Form.Group>

                            <Form.Group className="mb-3 col-lg-6" controlId="formBasicPassword">

                                <Form.Control type="password" name='password' placeholder="Password" />
                            </Form.Group>
                            <Button variant="primary" className='col-lg-6' style={{ background: "rgb(67, 185, 127)" }} type="submit">
                                Submit
                            </Button>
                        </Form>
                        <p className='mt-3'>Don't Have an Account?<span><NavLink to="/Home">Sign up</NavLink></span> </p>
                    </div>
                </section>
            </div>
            </div>
            </div>
            </div>
        </>
    )
}

export default Login