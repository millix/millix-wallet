import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button, Col, Dropdown, DropdownButton, Form, Row} from 'react-bootstrap';
import {CellMeasurerCache} from 'react-virtualized';
import {createObjectCsvWriter} from 'csv-writer';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import _ from 'lodash';


class EventsLogView extends Component {

    constructor(props) {
        super(props);
        this._cache = new CellMeasurerCache({
            defaultHeight: 85,
            fixedWidth: true
        });
        this.state = {
            fileKey: new Date().getTime(),
            typeFilter: 'all',
            contentFilter: '',
            events: [],
            enableAutoupdate: true
        };
        this.inputFilterText = React.createRef();
        this.tableColumns = [
            {
                dataField: 'key',
                text: 'key',
                hidden: true,
                style: {width: 0}
            },
            {
                dataField: 'date',
                text: 'date',
                style: {minWidth: 180}
            },
            {
                dataField: 'type',
                text: 'type'
            },
            {
                dataField: 'content',
                text: 'content',
                formatter: (cell) => {
                    return (<pre style={{color: 'white'}}>{cell}</pre>);
                }
            },
            {
                dataField: 'node',
                text: 'node'
            }
        ];
    }

    componentDidUpdate() {
        this._cache.clearAll();
    }

    UNSAFE_componentWillReceiveProps(props) {
        if (this.state.enableAutoupdate) {
            let filtered = this.filterByType(props.log.events, this.state.typeFilter);
            this.filterByContent(filtered, this.state.contentFilter);
        }
    }

    openDetails(data) {
        let {type, content} = data;
        if (type === 'transaction_new') {
            let transaction = JSON.parse(content).transaction;
            if (transaction) {
                this.props.history.push('/transaction/' + encodeURIComponent(transaction.transaction_id), [transaction]);
            }
        }
    }

    openExportDialog() {
        this.input.click();
    }

    exportLog() {
        console.log('saving logs to ', this.input.value);

        const csvWriter = createObjectCsvWriter({
            path: this.input.value,
            header: [
                {
                    id: 'type',
                    title: 'message type'
                },
                {
                    id: 'content',
                    title: 'content'
                },
                {
                    id: 'date',
                    title: 'date'
                },
                {
                    id: 'node',
                    title: 'node'
                }
            ]
        });

        const data = this.props.log.events.map((e) => {
            return {
                type: e.type,
                content: e.content,
                date: e.timestamp,
                node: e.ws && e.ws.node
            };
        });

        csvWriter
                .writeRecords(data)
                .then(() => console.log('The CSV file was written successfully'));

        // reset input
        this.setState({fileKey: new Date().getTime()});
    }

    getTypes() {
        let events = this.props.log.events;
        let types = new Set();
        types.add('all');
        for (let event of events) {
            if (event.type.split(':').length > 1) {
                continue;
            }

            types.add(event.type);
        }
        return types;
    }

    filterByType(events, typeFilter) {
        if (typeFilter !== 'all') {
            events = _.filter(events, event => event.type.split(':')[0] === typeFilter);
        }
        this.setState({
            typeFilter,
            events
        });
        return events;
    }

    filterByContent(events, contentFilter) {
        if (contentFilter !== '') {
            events = _.filter(events, event => event.content.includes(contentFilter));
        }
        this.setState({
            contentFilter,
            events
        });
        return events;
    }

    render() {
        let events = this.state.events;
        return (
                <div>
                    <Row className="mb-3 mt-3">
                        <Col className="pr-0" style={{
                            display: 'flex',
                            justifyContent: 'flex-end'
                        }}>
                            <Button variant="outline-secondary"
                                    onClick={this.openExportDialog.bind(this)}>
                                export log to csv
                            </Button>
                            <input style={{display: 'none'}} type="file"
                                   nwsaveas="log.csv" accept=".csv"
                                   ref={(component) => this.input = component}
                                   onChange={this.exportLog.bind(this)}
                                   key={this.state.fileKey}/>
                        </Col>
                    </Row>
                    <Form>
                        <Form.Group as={Row}>
                            <Form.Label column sm="2" className="pl-0">
                                message type
                            </Form.Label>
                            <Col sm="8">
                                <DropdownButton variant="secondary"
                                                title={this.state.typeFilter}>
                                    {Array.from(this.getTypes()).sort().map(type =>
                                            <Dropdown.Item key={type} href="#"
                                                           onClick={() => {
                                                               this.filterByType(this.props.log.events, type);
                                                           }}>{type}</Dropdown.Item>
                                    )}
                                </DropdownButton>
                            </Col>
                            <Col sm="2" style={{
                                display: 'flex',
                                justifyContent: 'flex-end'
                            }} className="pr-0">
                                <Form.Check
                                        type="switch"
                                        id="logSwitch"
                                        label="stream log"
                                        checked={this.state.enableAutoupdate}
                                        onChange={(e) => this.setState({enableAutoupdate: e.target.checked})}
                                />
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row}>
                            <Form.Label column sm="2" className="pl-0">
                                message content
                            </Form.Label>
                            <Col sm="10">
                                <Form.Control type="text"
                                              placeholder="filter content"
                                              ref={this.inputFilterText}
                                              onKeyDown={(e) => {
                                                  if (e.keyCode == 13) {
                                                      e.stopPropagation();
                                                      e.preventDefault();
                                                  }
                                              }}
                                              onChange={() => {
                                                  this.filterByContent(this.props.log.events, this.inputFilterText.current.value);
                                              }}/>
                            </Col>
                        </Form.Group>
                    </Form>
                    <Row className="mb-3">
                        <div style={{
                            width: '100%',
                            overflow: 'auto'
                        }}>
                            <BootstrapTable keyField='key'
                                            style={{tableLayout: 'auto'}}
                                            data={_.map(events, (event, idx) => {
                                                return {
                                                    key: idx,
                                                    type: event.type.split(':')[0],
                                                    content: event.content,
                                                    date: event.timestamp,
                                                    node: event.from
                                                };
                                            })}
                                            rowEvents={{
                                                onClick: (e, row, rowIndex) => {
                                                    this.openDetails(row);
                                                }
                                            }}
                                            columns={this.tableColumns}
                                            pagination={paginationFactory()}/>
                        </div>
                    </Row>
                </div>
        );
    }
}


export default connect(
        state => ({
            log: state.log
        }))(withRouter(EventsLogView));
