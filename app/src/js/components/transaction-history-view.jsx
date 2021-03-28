import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button, Col, Row, Table} from 'react-bootstrap';
import {walletUpdateTransactions} from '../redux/actions/index';
import {createObjectCsvWriter} from 'csv-writer';
import moment from 'moment';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {MDBDataTable as DataTable} from 'mdbreact';


class TransactionHistoryView extends Component {
    constructor(props) {
        super(props);
        this.state                 = {
            fileKey         : new Date().getTime(),
            transaction_list: {
                columns: [
                    {
                        label: '#',
                        field: 'idx'
                    },
                    {
                        label: [
                            <FontAwesomeIcon icon="user-clock" size="1x"/>,
                            ' date'
                        ],
                        field: 'date'
                    },
                    {
                        label: [
                            <FontAwesomeIcon icon="compress-arrows-alt"
                                             size="1x"/>,
                            ' amount'
                        ],
                        field: 'amount'
                    },
                    {
                        label: [
                            <FontAwesomeIcon icon="book" size="1x"/>,
                            ' txid'
                        ],
                        field: 'txid'
                    },
                    {
                        label: [
                            <FontAwesomeIcon icon="book" size="1x"/>,
                            ' from'
                        ],
                        field: 'from'
                    },
                    {
                        label: [
                            <FontAwesomeIcon icon="book" size="1x"/>,
                            ' to'
                        ],
                        field: 'to'
                    },
                    {
                        label: [
                            <FontAwesomeIcon icon="clock" size="1x"/>,
                            ' stable date'
                        ],
                        field: 'stable_date'
                    },
                    {
                        label: [
                            <FontAwesomeIcon icon="clock" size="1x"/>,
                            ' parent date'
                        ],
                        field: 'parent_date'
                    }
                ],
                rows   : []
            }
        };
        this.scrollObserverHandler = null;
    }

    UNSAFE_componentWillMount() {
        this.props.walletUpdateTransactions();
    }

    componentDidMount() {
        let scroll = $('#txhistory div[data-test="datatable-table"]').getNiceScroll();
        if (scroll.length === 0) {
            scroll = $('#txhistory div[data-test="datatable-table"]').niceScroll();
        }
        else {
            scroll.resize();
        }
        this.scrollObserverHandler = setInterval(() => scroll.resize(), 500);
    }

    componentWillUnmount() {
        clearInterval(this.scrollObserverHandler);
        this.scrollObserverHandler = null;
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (this.state.transaction_list.rows.length !== this.props.wallet.transactions.length) {
            const rows = this.props.wallet.transactions.map((transaction, idx) => ({
                clickEvent : () => this.props.history.push('/transaction/' + encodeURIComponent(transaction.transaction_id), [transaction]),
                idx        : this.props.wallet.transactions.length - idx,
                date       : moment.utc(transaction.transaction_date * 1000).format('YYYY-MM-DD HH:mm:ss'),
                amount     : transaction.amount.toLocaleString(),
                txid       : transaction.transaction_id,
                from       : transaction.input_address,
                to         : transaction.output_address,
                stable_date: transaction.stable_date && moment.utc(transaction.stable_date * 1000).format('YYYY-MM-DD HH:mm:ss'),
                parent_date: transaction.parent_date && moment.utc(transaction.parent_date * 1000).format('YYYY-MM-DD HH:mm:ss')
            }));
            this.setState({
                transaction_list: {
                    columns: [...this.state.transaction_list.columns],
                    rows
                }
            });
        }
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
                        <Row id={'txhistory'}>
                            <DataTable striped bordered small hover
                                       autoWidth={false}
                                       info={false}
                                       entries={10}
                                       entriesOptions={[
                                           10,
                                           30,
                                           50
                                       ]}
                                       data={this.state.transaction_list}/>
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
