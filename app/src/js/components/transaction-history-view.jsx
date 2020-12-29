import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button, Col, Row, Table} from 'react-bootstrap';
import {walletUpdateTransactions} from '../redux/actions/index';
import {createObjectCsvWriter} from 'csv-writer';
import moment from 'moment';


class TransactionHistoryView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fileKey: new Date().getTime()
        };
    }

    UNSAFE_componentWillMount() {
        this.props.walletUpdateTransactions();
    }

    openExportDialog() {
        this.input.click();
    }

    exportTransactions() {

        if (this.input.value === '') {
            return;
        }

        console.log('saving transactions to ', this.input.value);

        const csvWriter = createObjectCsvWriter({
            path  : this.input.value,
            header: [
                {
                    id   : 'transaction_id',
                    title: 'Transaction ID'
                },
                {
                    id   : 'input_address',
                    title: 'Input address'
                },
                {
                    id   : 'output_address',
                    title: 'Output address'
                },
                {
                    id   : 'income',
                    title: 'Is income'
                },
                {
                    id   : 'amount',
                    title: 'Amount'
                },
                {
                    id   : 'is_stable',
                    title: 'Is stable'
                },
                {
                    id   : 'is_free',
                    title: 'Is free'
                },
                {
                    id   : 'creation_date',
                    title: 'Date'
                }
            ]
        });

        csvWriter
            .writeRecords(this.props.wallet.transactions)
            .then(() => console.log('The CSV file was written successfully'));

        // reset input
        this.setState({fileKey: new Date().getTime()});
    }

    render() {
        return (
            <div>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading'}>transaction</div>
                    <hr className={'hrPanel'}/>
                    <div className={'panel-body'}>

                        <Row className="mb-3 mt-3">
                            <Col className="pr-0" style={{
                                display       : 'flex',
                                justifyContent: 'flex-end'
                            }}>
                                <Button variant="light"
                                        className={'btn btn-w-md btn-accent'}
                                        onClick={this.openExportDialog.bind(this)}>
                                    export transactions to csv
                                </Button>
                                <input style={{display: 'none'}} type="file"
                                       nwsaveas="transactions.csv" accept=".csv"
                                       ref={(component) => this.input = component}
                                       onChange={this.exportTransactions.bind(this)}
                                       key={this.state.fileKey}/>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <div style={{
                                width   : '100%',
                                overflow: 'auto'
                            }}>
                                <Table striped bordered hover variant="dark">
                                    <thead>
                                    <tr>
                                        <th>#</th>
                                        <th style={{minWidth: 185}}>date</th>
                                        <th>amount</th>
                                        <th>transaction id</th>
                                        <th>from address</th>
                                        <th>to address</th>
                                        <th style={{minWidth: 185}}>stable
                                            date
                                        </th>
                                        <th style={{minWidth: 185}}>parent
                                            date
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {this.props.wallet.transactions.map((transaction, idx) => {
                                        return (<tr key={idx}
                                                    className="wallet-address"
                                                    onClick={() => {
                                                        this.props.history.push('/transaction/' + encodeURIComponent(transaction.transaction_id), [transaction]);
                                                    }}>
                                            <td>{this.props.wallet.transactions.length - idx}</td>
                                            <td>{moment.utc(transaction.transaction_date * 1000).format('YYYY-MM-DD HH:mm:ss')}</td>
                                            <td style={transaction.income ? {color: 'green'} : {color: 'red'}}>{transaction.amount.toLocaleString()}</td>
                                            <td>{transaction.transaction_id}</td>
                                            <td>{transaction.input_address}</td>
                                            <td>{transaction.output_address}</td>
                                            <td>{transaction.stable_date && moment.utc(transaction.stable_date * 1000).format('YYYY-MM-DD HH:mm:ss')}</td>
                                            <td>{transaction.parent_date && moment.utc(transaction.parent_date * 1000).format('YYYY-MM-DD HH:mm:ss')}</td>
                                        </tr>);
                                    })}
                                    </tbody>
                                </Table>
                            </div>
                        </Row>
                    </div>
                </div>
            </div>
        );
    }
}


export default connect(
    state => ({
        wallet: state.wallet
    }),
    {
        walletUpdateTransactions
    }
)(withRouter(TransactionHistoryView));
