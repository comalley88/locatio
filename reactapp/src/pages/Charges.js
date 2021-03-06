import React, { useEffect, useState } from 'react'
import { Button, Col, Container, Row, Table, Card, CardBody, CardText, Modal, ModalHeader, ModalBody, ModalFooter, Input, Form, FormGroup, Badge, Label } from 'reactstrap'
import NavBarMain from '../components/NavBarMain'
import BarChart from '../components/BarChart'
import { useParams } from 'react-router-dom';
import { FaTrashAlt } from 'react-icons/fa';

import { connect } from 'react-redux'


function Charges(props) {

    // state variable to store list of all finance documents 
    const [financeList, setFinanceList] = useState([])

    // state variables to calculate global balance of charges
    const [totalProvisions, setTotalProvisions] = useState(0)
    const [totalCharges, setTotalCharges] = useState(0)

    //state variables used to send data from 'add expense' to backend 
    const [chargeDescription, setChargeDescription] = useState('')
    const [chargeCost, setChargeCost] = useState(null)
    const [chargeDate, setChargeDate] = useState(new Date(''))
    const [chargeFrequence, setChargeFrequence] = useState(null)

    // state variable to control modal popup to add a charge
    const [modal, setModal] = useState(false);
    const toggle = () => setModal(!modal);

    // state variable to control modal popup to add a charge
    const [modalRegul, setModalRegul] = useState(false);
    const toggleModalRegul = () => setModalRegul(!modalRegul);

    // state variable to control modal popup to delete a charge
    const [modalConfirmDelete, setModalConfirmDelete] = useState(false)
    const [chargeToDelete, setChargeToDelete] = useState({})

    const toggleModalConfirmDelete = (finance) => {
        setModalConfirmDelete(!modalConfirmDelete)
        setChargeToDelete(finance)
    }

    // state variable to control useEffect with every additional charge added
    const [resetChargesUseEffect, setResetChargesUseEffect] = useState([])

    // state variable to control useEffect with every additional charge added
    const [pageUpdate, setPageUpdate] = useState(false)

    const [disabled, setdisabled] = useState(false)

    var currentMonth = new Date().getMonth()

    useEffect(() => {
        async function loadData() {
            var rawResponse = await fetch(`/finance/${props.token}`);
            var response = await rawResponse.json();

            var filteredList = response.filter(item => item.type === 'charge' || item.type === 'provision' || item.type === 'regularisation')

            console.log('filtered list is', filteredList)
            setFinanceList(filteredList)

            //*******************************global sum of charges to date(includes any reguliarisations)**********************/
            var sumCharges = 0;
            response.forEach((element) => {
                if (new Date(element.dateDebut).getMonth() <= currentMonth) {
                    if (element.type === 'charge') {
                        sumCharges += element.montant
                    }
                }
            })
            var sumRegularistionDeCharges = 0
            response.forEach((element) => {
                if (element.regulariserCharge) {
                    sumRegularistionDeCharges += element.regulariserCharge
                }
                if (element.paiement < 0) {
                    sumRegularistionDeCharges -= element.paiement
                }
            }
            )

            setTotalCharges((sumCharges - sumRegularistionDeCharges))

            //******************************global sum of provisions to date(includes any reguliarisations)*************************/
            var sumProvisions = 0;
            response.forEach((element) => {
                if (element.type === 'provision') {
                    sumProvisions += element.montant //* (currentMonth+1)
                }
            })

            var sumRegularistionDeProvisions = 0
            response.forEach((element) => {
                if (element.regulariserProvision) {
                    sumRegularistionDeProvisions += element.regulariserProvision
                }
                if (element.paiement > 0) {
                    sumRegularistionDeProvisions += element.paiement
                }
            }
            )
            setTotalProvisions((sumProvisions - sumRegularistionDeProvisions))

        } loadData()

        console.log('button status via use effect: ', disabled)
    }, [pageUpdate])

    //******************************Function to POST new charge to DB and relaunch useEffect********************/

    var handleAddCharge = async () => {

        var rawResponse = await fetch('/finance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `typeFromFront=charge&descriptionFromFront=${chargeDescription}&amountFromFront=${chargeCost}&dateDebutFromFront=${chargeDate}&frequencyFromFront=${chargeFrequence}&token=${props.token}`
        });

        var response = await rawResponse.json();

        toggle()
        props.onClickButton(response)
        setdisabled(false)
        setPageUpdate(!pageUpdate)
        console.log('button is disabled when charge added: ', disabled)
    }
    //***********************************Function to RESET all charges Locataire/proprietaire***********************/
    var resetCharges = async () => {

        console.log(totalCharges)

        var rawResponse = await fetch('/finance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `typeFromFront=regularisation&totalChargesFromFront=${totalCharges}&totalProvisionsFromFront=${totalProvisions}&amountFromFront=${totalProvisions - totalCharges}&descriptionFromFront=regularisation de charges&dateDebutFromFront=${new Date()}&token=${props.token}`
        });

        var response = await rawResponse.json();

        setTotalProvisions(0)
        setTotalCharges(0)
        setdisabled(true)
        toggleModalRegul()
        props.onClickButton(response)
        setPageUpdate(!pageUpdate)
    }
    //***********************************Function to DELETE a charge Locataire/proprietaire***********************/

    var clickToDeleteCharge = async (chargeToDelete) => {

        var deleteCharge = await fetch('/delete-charge', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `chargeId=${chargeToDelete._id}`
        });
        console.log(deleteCharge)
        var response = await deleteCharge.json()
        console.log('has document been deleted', response.result)

        setPageUpdate(true)
        props.onClickButton(response)
        setModalConfirmDelete(!modalConfirmDelete)
    }

    //***********************************Message for modal Regul. charges***********************/
    if (totalProvisions - totalCharges > 0) {
        var modalRegulCharges = <p>Vous devez rembourser {totalProvisions - totalCharges}??? ?? vos locataires</p>
    } else {
        modalRegulCharges = <p>Vous devez rembourser {totalCharges - totalProvisions}??? ?? vos locataires</p>
    }

    //***********************************Message for modal Regul. charges***********************/


    return (

        <div >
            <NavBarMain />
            <h1 style={{ marginTop: "50px", marginBottom: "20px", textAlign: 'center' }}>Visualisez et r??gularisez les charges locatives</h1>
            <Container fluid>

                <Row style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Col lg='5'>
                        <h5>Equilibre sur la p??riode en cours</h5>
                        <Card>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '16px', paddingRight: '16px' }}>
                                <span style={{ width: '125px', textAlign: 'center' }}>Total des charges provisionn??es</span>
                                <span style={{ width: '125px', textAlign: 'center' }}>Total des charges r??elles</span>
                                <span style={{ width: '125px', textAlign: 'center' }}>??cart global</span>
                            </div>
                            <CardBody style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div className='circleProvision'><CardText style={{ color: '#FFFFFF', margin: 'auto' }}>{totalProvisions}???</CardText></div> -
                                <div className='circleCharges'><CardText style={{ color: '#FFFFFF', margin: 'auto' }}>{totalCharges}???</CardText></div> =
                                <div className='circleTotal'><CardText style={{ color: '#FFFFFF', margin: 'auto' }}>{totalProvisions - totalCharges}???</CardText></div>
                            </CardBody>
                            <Button disabled={disabled} onClick={() => toggleModalRegul()} style={{ backgroundColor: '#00C689', borderColor: '#00C689' }}>R??gulariser les charges</Button>
                        </Card>
                    </Col>
                    <Col lg='6' style={{ paddingTop: '30px' }}><BarChart /></Col>
                </Row>
                <Row style={{ marginTop: '20px', paddingBottom: '10px' }}><Col style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h3>Charges et provisions</h3>
                    <Button
                        style={{ backgroundColor: '#00C689', borderColor: '#00C689' }}
                        onClick={() => toggle()}
                    >
                        Ajouter une charge
                    </Button>
                </Col></Row>
                <Row style={{  overflow: 'auto' }}>
                    <Table><thead style={{ borderBottomColor: '#FFB039', position: 'sticky', top: '0', backgroundColor: '#FFB039', color: '#FFFFFF' }}><tr><th style={{ width: '25%' }}>Type</th><th style={{ width: '25%' }}>Description</th><th style={{ width: '25%' }}>Montant</th><th style={{ width: '25%' }}>Date</th><th>Supprimer</th></tr></thead><tbody>

                        {financeList.map((finance, i) => {
                            if (finance.type === 'charge') {
                                var badgeColor = 'danger'
                            } else {
                                badgeColor = 'success'
                            }
                            return (
                                <tr style={{ height: '50px' }} key={i}><th scope="row"><Badge pill color={badgeColor} style={{ width: '100px' }}>{finance.type}</Badge></th><td>{finance.description}</td><td>{finance.montant}???</td><td>{new Date(finance.dateDebut).toLocaleDateString()}</td><td><FaTrashAlt className="trash" onClick={() => toggleModalConfirmDelete(finance)} style={{ marginRight: "5px", cursor: "pointer" }}></FaTrashAlt></td></tr>
                            )
                        })}

                    </tbody>
                    </Table>
                </Row>
            </Container>
            <Modal isOpen={modal}
            >
                <ModalHeader style={{ justifyContent: 'center' }} >
                    Ajouter une charge
                </ModalHeader>
                <ModalBody>
                    <Form>
                        <FormGroup> <Input onChange={(e) => setChargeDescription(e.target.value)} placeholder="Description" type="string" /></FormGroup>
                        <FormGroup> <Input onChange={(e) => setChargeCost(parseInt(e.target.value))} placeholder="Montant" type="number" /></FormGroup>
                        <FormGroup> <Input onChange={(e) => setChargeFrequence(parseInt(e.target.value))} placeholder="Fr??quence" type="select"><option value="" disabled selected>Fr??quence</option><option>Ponctuelle</option><option>Mensuelle</option><option>Trimestrielle</option><option>Annuelle</option></Input></FormGroup>
                        <FormGroup> <Label>Date de d??but</Label><Input onChange={(date) => setChargeDate(new Date(date.target.value))} placeholder="Date" type="date" /></FormGroup>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button
                        style={{ backgroundColor: '#00C689', borderColor: '#00C689' }}
                        onClick={() => handleAddCharge()}
                    >
                        Ajouter
                    </Button>
                    {' '}
                    <Button onClick={() => toggle()}>
                        Annuler
                    </Button>
                </ModalFooter>
            </Modal>
            <Modal isOpen={modalRegul}
            >
                <ModalHeader style={{ justifyContent: 'center' }} >
                    R??gularisation des charges
                </ModalHeader>
                <ModalBody>

                    {modalRegulCharges}

                </ModalBody>
                <ModalFooter>
                    <Button
                        style={{ backgroundColor: '#00C689', borderColor: '#00C689' }}
                        onClick={() => resetCharges()}
                    >
                        Effectuer la r??gularisation
                    </Button>
                    {' '}
                    <Button onClick={() => toggleModalRegul()}>
                        Annuler
                    </Button>
                </ModalFooter>
            </Modal>
            <Modal isOpen={modalConfirmDelete}
            >
                <ModalHeader style={{ justifyContent: 'center' }} >
                    Confirmer la suppression
                </ModalHeader>
                <ModalBody>

                    Souhaitez-vous supprimer cette d??pense ?

                </ModalBody>
                <ModalFooter>
                    <Button
                        style={{ backgroundColor: '#00C689', borderColor: '#00C689' }}
                        onClick={() => clickToDeleteCharge(chargeToDelete)}
                    >
                        Supprimer
                    </Button>
                    {' '}
                    <Button onClick={() => toggleModalConfirmDelete()}>
                        Annuler
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    )
}

function mapDispatchToProps(dispatch) {
    return {
        onClickButton: function (clickDescription) {
            console.log('passed to reducer:', clickDescription)
            dispatch({ type: 'update', update: clickDescription })
        }
    }
}

function mapStateToProps(state) {
    return { token: state.token }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Charges);
