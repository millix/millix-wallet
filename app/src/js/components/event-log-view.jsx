import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button, Col, Form, Row} from 'react-bootstrap';
import {CellMeasurerCache} from 'react-virtualized';
import {createObjectCsvWriter} from 'csv-writer';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import Switch from 'react-switchery';
import _ from 'lodash';


class EventsLogView extends Component {

    constructor(props) {
        super(props);
        this._cache          = new CellMeasurerCache({
            defaultHeight: 85,
            fixedWidth   : true
        });
        this.state           = {
            fileKey         : new Date().getTime(),
            typeFilter      : 'all',
            contentFilter   : '',
            events          : [],
            enableAutoUpdate: true
        };
        this.inputFilterText = React.createRef();
        this.types           = new Set();
        this.types.add('all');
        this.tableColumns = [
            {
                dataField: 'key',
                text     : 'key',
                hidden   : true,
                style    : {width: 0}
            },
            {
                dataField: 'date',
                text     : 'date',
                style    : {minWidth: 180}
            },
            {
                dataField: 'type',
                text     : 'type'
            },
            {
                dataField: 'content',
                text     : 'content',
                formatter: (cell) => {
                    return (<pre>{cell}</pre>);
                }
            },
            {
                dataField: 'node',
                text     : 'node'
            }
        ];
    }

    componentDidMount() {
    }

    componentDidUpdate() {
        this._cache.clearAll();
    }

    UNSAFE_componentWillReceiveProps(props) {
        if (this.state.enableAutoUpdate) {
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
            path  : this.input.value,
            header: [
                {
                    id   : 'type',
                    title: 'message type'
                },
                {
                    id   : 'content',
                    title: 'content'
                },
                {
                    id   : 'date',
                    title: 'date'
                },
                {
                    id   : 'node',
                    title: 'node'
                }
            ]
        });

        const data = this.props.log.events.map((e) => {
            return {
                type   : e.type,
                content: e.content,
                date   : e.timestamp,
                node   : e.ws && e.ws.node
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
        for (let event of events) {
            if (event.type.split(':').length > 1) {
                continue;
            }

            this.types.add(event.type);
        }
        return this.types;
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

                <Row>
                    <Col md={12}>
                        <div className={'panel panel-filled'}>
                            <div
                                className={'panel-heading'}>logs
                            </div>
                            <hr className={'hrPanel'}/>
                            <div className={'panel-body'}>

                                <Form>
                                    <Form.Group>
                                        <label
                                            className="control-label">message
                                            type</label>
                                        <div
                                            className="btn-group btn-full-width">
                                            <button data-toggle="dropdown"
                                                    className="btn btn-accent dropdown-toggle btn-full-width dropdown-luna"
                                                    aria-expanded="false">
                                                <p style={{
                                                    float       : 'left',
                                                    marginBottom: '0px'
                                                }}>{this.state.typeFilter}</p>
                                                <p style={{
                                                    float       : 'right',
                                                    marginBottom: '0px'
                                                }}><span className="caret"/></p>
                                            </button>
                                            <ul className="dropdown-menu btn-full-width dropdown-lu">
                                                {Array.from(this.getTypes()).sort().map(type =>
                                                    <li><a
                                                           className="li-a"
                                                           key={type}
                                                           href="#"
                                                           onClick={() => {
                                                               this.filterByType(this.props.log.events, type);
                                                           }}>{type}</a>
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    </Form.Group>
                                    <Form.Group>
                                        <label
                                            className="control-label">message
                                            content</label>
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
                                    </Form.Group>
                                </Form>
                                <Row className="mb-3 mt-3">
                                    <Col sm="2">
                                        <Form.Group>

                                            <label
                                                className="control-label">stream
                                                log</label>

                                            <Switch
                                                className={'switch-class network-switch'}
                                                id="logSwitch"
                                                options={
                                                    {
                                                        color: '#9400CE',
                                                        size : 'small'
                                                    }
                                                }
                                                checked={this.state.enableAutoUpdate}
                                                onChange={(checked) => this.setState({enableAutoUpdate: checked})}
                                            />

                                        </Form.Group>
                                    </Col>
                                    <Col className="pr-0" style={{
                                        display       : 'flex',
                                        justifyContent: 'flex-end'
                                    }}>
                                        <Button variant="light"
                                                className={'btn btn-w-md btn-accent'}
                                                onClick={this.openExportDialog.bind(this)}
                                                style={{marginTop: "8px"}}>
                                            export log to csv
                                        </Button>
                                        <input style={{display: 'none'}}
                                               type="file"
                                               nwsaveas="log.csv" accept=".csv"
                                               ref={(component) => this.input = component}
                                               onChange={this.exportLog.bind(this)}
                                               key={this.state.fileKey}/>
                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <div style={{
                                        width   : '100%',
                                        overflow: 'auto'
                                    }}>
                                        <BootstrapTable keyField='key'
                                                        style={{tableLayout: 'auto'}}
                                                        data={_.map(events, (event, idx) => {
                                                            return {
                                                                key    : idx,
                                                                type   : event.type.split(':')[0],
                                                                content: event.content,
                                                                date   : event.timestamp,
                                                                node   : event.from
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

                        </div>
                    </Col>
                </Row>

            </div>
        );
    }
}


export default connect(
    state => ({
        log: state.log
    }))(withRouter(EventsLogView));
