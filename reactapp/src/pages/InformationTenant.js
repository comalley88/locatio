import React, { useState } from 'react';
import '../App.css';
import { Row, Col, Button, Form, FormGroup, Input, Alert } from 'reactstrap';
import Stepper from 'react-stepper-horizontal';
import { useNavigate } from "react-router-dom";

import NavBarHome from '../components/NavBarHome';

export default function InformationTenant() {
    let navigate = useNavigate();
    const [tenantFirstname, setTenantFirstname] = useState('')
    const [tenantLastname, setTenantLastname] = useState('')
    const [tenantEmail, setTenantEmail] = useState('')
    const [tenantInputFields, setTenantInputFields] = useState(["inputField"])
    const [alert, setAlert] = useState(false);

    var renderTenantInputFields = tenantInputFields.map((inputField, i) => {
        return (
            <Col>
            <Row style={{ display: 'flex', flexDirection: 'row', width: '20vw', flexWrap: 'unset', justifyContent: 'center' }}>
                    <Input type="text" className="Login-input" onChange={(e) => { setTenantFirstname(e.target.value); setAlert(false); }} placeholder="Prénom" />
                    <Input type="text" className="Login-input" onChange={(e) => { setTenantLastname(e.target.value); setAlert(false); }} placeholder="Nom" />
                </Row>
                <Input className="Login-input" type="email" placeholder="Email" onChange={(e) => setTenantEmail(e.target.value)} />
            </Col>
                
            
        )
    })

    var handleAddTenant = async () => {
        if (tenantFirstname && tenantLastname) {
            console.log("trying to add tenant")
            const data = await fetch('/sign-up-tenant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `firstName=${tenantFirstname}&lastName=${tenantLastname}&email=${tenantEmail}&landlord=${false}`
            });
            const body = await data.json()
            console.log(body.result)
            setTenantInputFields([...tenantInputFields, "inputField"]);
            setTenantFirstname('');
            setTenantLastname('');
        } else {
            setAlert(true)
        }
    }

    var handleSubmitTenantInfo = async () => {
        const data = await fetch('/sign-up-tenant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `firstName=${tenantFirstname}&lastName=${tenantLastname}&landlord=${false}`
        })
        const body = await data.json()

        if (body.result === true) {
            navigate('/documents');
        } else {
            setAlert(true)
        }
    }

    return (
        <>
            <NavBarHome />

            <div className="Signup-page" >
                <Alert
                    color="primary"
                >
                    Ici, vous pouvez renseigner l'identité de votre (ou vos) locataire(s) et envoyer une invitation à rejoindre l'application.
                </Alert>

                <div className="Signup-area">
                    <Stepper
                        steps={[{ title: 'Informations du bien' }, { title: 'Informations de la location' }, { title: 'Informations locataire(s)' }]}
                        activeStep={2}
                        activeColor={'#00C689'}
                        completeColor={'#00C689'}
                    />
                    <Form className="Signup-area">
                        <h2>Informations locataire(s)</h2>
                        <FormGroup >
                            <Col style={{ display: 'flex', flexDirection: 'column' }}>
                                {renderTenantInputFields}
                                <Alert color="danger" isOpen={alert} >Merci de remplir tous les champs</Alert>
                                <Button onClick={() => handleAddTenant()} className="Button" style={{ color: '#00C689', backgroundColor: 'white', border: 'solid', borderColor: '#00C689' }} >Ajouter un(e) locataire</Button>
                            </Col>
                        </FormGroup>
                        <Button onClick={() => handleSubmitTenantInfo()} className="Button" style={{ backgroundColor: '#00C689' }} >Valider</Button>
                    </Form>
                </div>
            </div>
        </>
    );
}
