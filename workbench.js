import React from 'react';
import axios from 'axios';
import _ from '@lodash';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { AllCommunityModules } from '@ag-grid-community/all-modules';
import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-balham-dark.css';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import TextField from '@material-ui/core/TextField';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import Button from '@material-ui/core/Button';
import swal from 'sweetalert';
import clsx from 'clsx';
import Card from '@material-ui/core/Card';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import Autocomplete from '@material-ui/lab/Autocomplete';
import MuiAlert from '@material-ui/lab/Alert';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { withStyles } from '@material-ui/styles';
import Draggable from 'react-draggable';
import { TextareaAutosize, Checkbox } from '@material-ui/core';
import Tooltip from '@material-ui/core/Tooltip';
import PanToolIcon from '@material-ui/icons/PanTool';
import CloseIcon from '@material-ui/icons/Close';
import CheckIcon from '@material-ui/icons/Check';
// import Pagination from '@material-ui/lab/Pagination';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import jsPDFWBInvoiceTemplate from './WBInvoiceTemplate';
import styles from '../useStyles/materialUIControls';
import Settings from '../../../config/globalConfig';
import './workbench.css';

let invLineData = [];
let invLineItems = [];
let iframeSrc = '';

function PaperComponent(props) {
	return (
		<Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
			<Paper style={{ borderRadius: 0 }} {...props} />
		</Draggable>
	);
}

const apiUrl = Settings.API_ROOT;

class Workbench extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			// frameworkComponents: '',
			showHideAdd: true,
			showHideDelete: true,
			showHideEdit: true,
			showHideView: true,
			showHideList: true,
			// showForOtherTab: true,
			modules: AllCommunityModules,
			showclaimlistb: false,
			examiner: '',
			examinersList: [],
			adjuster: '',
			adjustersList: [],
			claimtype: '',
			claimtypes: [],
			assignmenttype: '',
			assignmenttypes: [],
			client: '',
			clients: '',
			clientsList: [],
			notcontactedList: [],
			late: '',
			lateList: [],
			states: '',
			stateList: [],
			searchexaminer: '',
			claimID: '',
			notcontacted: '',
			notinspected: '',
			policynumber: '',
			ryzefilenumber: '',
			ryzefileList: [],
			claimList: [],
			claimnumber: '',
			claimnumberList: [],
			workbenchFilterData: [],
			emptyclaims: true,
			showcommentdialog: false,
			commentdialoguebox: false,
			notesdialoguebox: false,
			showAddcommentdiv: false,
			showListcommentdiv: false,
			showAddnotediv: false,
			showListnotediv: false,
			receiveddate: '',
			assigneddate: '',
			contactedate: '',
			claimcomments: [],
			isclientval: false,
			commentval: '',
			claimnotesList: [],
			commentsState: [],
			notesState: [],
			accordianid: null,
			isaccordian: true,
			showacceptdialog: false,
			showrejectdialog: false,
			showholddialog: false,
			rejectReason: '',
			currdocid: null,
			claimReportReview: [],
			isexpand: true,
			fwc: false
		};
	}

	componentDidMount() {
		const pData = [...this.props.permissiondata.user.permission];
		if (pData !== undefined || pData !== null) {
			const getModuleData = pData.filter(f => f.modulename === 'workbench');
			this.permissionValidator(getModuleData);
		}
		console.log(this.props);
		this.getStatesList();
		this.getAllClaims();
		// check result
		// this.setState({
		// 	showclaimlistb: true
		// });
		// this.showclaimlist();
		// check result
	}

	static getDerivedStateFromProps(props, state) {
		if (props.clients && props.systemfields) {
			return {
				examiners:
					props.clients &&
					props.clients.filter(
						i => i.roles && i.roles.toString().toLowerCase().split(',').includes('examiner')
					),
				adjusters:
					props.clients &&
					props.clients.filter(
						i => i.roles && i.roles.toString().toLowerCase().split(',').includes('adjuster')
					),
				clients:
					props.clients &&
					props.clients.filter(
						i => i.roles && i.roles.toString().toLowerCase().split(',').includes('client')
					),
				claimtypes:
					props.systemfields &&
					props.systemfields.filter(i => i.fieldname.toString().toLowerCase() === 'types of claim'),
				assignmenttypes:
					props.systemfields &&
					props.systemfields.filter(i => i.fieldname.toString().toLowerCase() === 'assignment type'),
				notcontactedList:
					props.systemfields &&
					props.systemfields.filter(i => i.fieldname.toString().toLowerCase() === 'not contacted'),
				notinspectedList:
					props.systemfields &&
					props.systemfields.filter(i => i.fieldname.toString().toLowerCase() === 'not inspected'),
				lateList:
					props.systemfields &&
					props.systemfields.filter(i => i.fieldname.toString().toLowerCase() === 'late'),
				claimReportReview:
					props.systemfields &&
					props.systemfields.filter(i => i.fieldname.toString().toLowerCase() === 'claim report review'),
				userid: props.userid,
				clientid: props.clientid,
				roles: props.roles
			};
		}
		return null;
	}

	handlefwcchange(e) {
		this.setState({
			fwc: e.target.value
		});
	}

	getStatesList = () => {
		axios
			.get(`${apiUrl}/api/license/listallstateslist`)
			.then(response => response.data)
			.then(
				result => {
					if (result.data && result.data.length) {
						this.setState({
							stateList: result.data
						});
					}
				},
				err => {
					console.log(err);
				}
			);
	};

	getAllClaims = () => {
		axios
			.get(`${apiUrl}/api/claims/list`)
			.then(response => response.data)
			.then(
				result => {
					if (result.data && result.data.length) {
						this.setState({
							claimList: result.data
						});
					}
				},
				err => {
					console.log(err);
				}
			);
	};

	showclaimlist = () => {
		const {
			examiner,
			adjuster,
			client,
			claimtype,
			assignmenttype,
			notcontacted,
			notinspected,
			late,
			states,
			ryzefilenumber,
			claimnumber,
			fwc
		} = this.state;
		const params = {
			examiner: examiner ? examiner.clientid : null,
			adjustorid: adjuster ? adjuster.clientid : null,
			clientid: client ? client.clientid : null,
			claimtype: claimtype.systemfieldid ? claimtype.systemfieldid : null,
			assignmenttype: assignmenttype.systemfieldid ? assignmenttype.systemfieldid : null,
			notcontacted: notcontacted ? Number(notcontacted.subtypedescription) : null,
			notinspected: notinspected ? Number(notinspected.subtypedescription) : null,
			late: late ? Number(late.subtypedescription) : null,
			states: states ? states.state : null,
			ryzefilenumber: ryzefilenumber ? ryzefilenumber.ryzefilenumber : null,
			claimnumber: claimnumber ? claimnumber.claimnumber : null,
			fwcval: fwc
		};
		axios
			.post(`${apiUrl}/api/workbench/listall`, params)
			.then(response => response.data)
			.then(
				result => {
					if (result.data && result.data.length) {
						console.log(result.data);
						// eslint-disable-next-line func-names
						const resultset = result.data.map(function (i) {
							i.expand = true;
							return i;
						});
						console.log(resultset);
						this.setState({
							// rowData: result.data,
							workbenchFilterData: resultset,
							emptyclaims: true
						});
					} else {
						// this.gridApi.showNoRowsOverlay();
						this.setState({
							// rowData: [],
							workbenchFilterData: [],
							emptyclaims: false
						});
					}
				},
				err => {
					console.log(err);
				}
			);
	};

	additem = () => {
		this.props.history.push(`/createclaim`, { iseditclaim: false });
	};

	permissionValidator = permissionData => {
		if (permissionData && permissionData.length > 0) {
			this.setState({
				// showHideAdd: !!permissionData.find(f => f.submodulename.toString().toLowerCase() === 'add'),
				// showHideEdit: !!permissionData.find(f => f.submodulename.toString().toLowerCase() === 'edit'),
				// showHideDelete: !!permissionData.find(f => f.submodulename.toString().toLowerCase() === 'delete'),
				// showHideView: !!permissionData.find(f => f.submodulename.toString().toLowerCase() === 'view'),
				showHideList: !!permissionData.find(f => f.submodulename.toString().toLowerCase() === 'list')
				// showForOtherTab: this.handleCheck(permissionData)
			});
		}
	};

	handlesearch = () => {
		this.setState({
			showclaimlistb: true
		});
		this.showclaimlist();
	};

	handlereset = () => {
		this.setState({
			showclaimlistb: false,
			examiner: '',
			adjuster: '',
			client: '',
			claimtype: '',
			assignmenttype: ''
		});
	};

	onSearchClient = e => {
		const { name } = e.target;
		if (e.target.value.length > 2) {
			const searchtext = e.target.value;
			const dataset = this.state[name];
			const filterExaminerAdjusterClient = dataset.filter(
				f =>
					f.firstname?.toLowerCase().toString().includes(searchtext.toLowerCase().toString()) ||
					f.lastname?.toLowerCase().toString().includes(searchtext.toLowerCase().toString()) ||
					f.companyname?.toLowerCase().toString().includes(searchtext.toLowerCase().toString())
			);
			if (filterExaminerAdjusterClient.length > 0) {
				this.setState({
					[`${name}List`]: filterExaminerAdjusterClient
				});
			} else {
				this.setState({
					[`${name}List`]: []
				});
			}
		} else {
			this.setState({
				[`${name}List`]: []
			});
		}
	};

	onSearchRyzeFileNumber = e => {
		const searchnumber = e.target.value;
		const { claimList } = this.state;
		if (e.target.value.length > 2) {
			const filterryzefilenumber = claimList.filter(i =>
				i.ryzefilenumber?.toLowerCase().toString().includes(searchnumber.toLowerCase().toString())
			);
			if (filterryzefilenumber.length > 0) {
				this.setState({
					ryzefileList: filterryzefilenumber
				});
			}
		}
	};

	onSearchClaimNumber = e => {
		const searchnumber = e.target.value;
		const { claimList } = this.state;
		if (e.target.value.length > 2) {
			const filterclaimnumber = claimList.filter(i =>
				i.claimnumber?.toLowerCase().toString().includes(searchnumber.toLowerCase().toString())
			);
			if (filterclaimnumber.length > 0) {
				this.setState({
					claimnumberList: filterclaimnumber
				});
			}
		}
	};

	updateclaim = (val1, val2) => {
		this.props.history.push(`/updateclaim`, {
			claimid: val1,
			policynumber: val2,
			isLocked: false,
			iseditclaim: true
		});
	};

	handlecontacteddatecompare = (event, newValue) => {
		if (newValue !== null) {
			this.setState({
				notcontacted: newValue
			});
		} else {
			this.setState({
				notcontacted: ''
			});
		}
	};

	handleinspecteddatecompare = (event, newValue) => {
		if (newValue !== null) {
			this.setState({
				notinspected: newValue
			});
		} else {
			this.setState({
				notinspected: ''
			});
		}
	};

	handlelatedatecompare = (event, newValue) => {
		if (newValue !== null) {
			this.setState({
				late: newValue
			});
		} else {
			this.setState({
				late: ''
			});
		}
	};

	handlestatechange = (event, newValue) => {
		if (newValue !== null) {
			this.setState({
				states: newValue
			});
		} else {
			this.setState({
				states: ''
			});
		}
	};

	// comment

	handlecommentdialogopen = id => {
		const { workbenchFilterData } = this.state;
		const tempdataset = [...workbenchFilterData].find(i => i.claimid === id);
		const { claimcomments } = tempdataset;

		this.setState({
			commentdialoguebox: true,
			showListcommentdiv: true,
			showAddcommentdiv: true,
			commentsState: claimcomments,
			claimID: id
		});
	};

	handlecommentdialogclose = () => {
		this.setState({
			commentdialoguebox: false
		});
	};

	showaddcommentdialog = () => {
		this.setState({
			showAddcommentdiv: true,
			showListcommentdiv: false,
			commentval: ''
		});
	};

	handleaddcommentCancel = () => {
		this.setState({
			showAddcommentdiv: false,
			showListcommentdiv: true
		});
	};

	// notes

	handlenotesdialogopen = id => {
		const { workbenchFilterData } = this.state;
		const tempdataset = [...workbenchFilterData].find(i => i.claimid === id);
		const { claimnotes } = tempdataset;
		this.setState({
			notesdialoguebox: true,
			showListnotediv: true,
			showAddnotediv: true,
			notesState: claimnotes,
			claimID: id
		});
	};

	handlenotesdialogclose = () => {
		this.setState({
			notesdialoguebox: false
		});
	};

	showaddnotedialog = () => {
		this.setState({
			showAddnotediv: true,
			showListnotediv: false,
			commentval: ''
		});
	};

	handleaddnoteCancel = () => {
		this.setState({
			showAddnotediv: false,
			showListnotediv: true
		});
	};

	setClient = () => {
		const { isclientval } = this.state;
		this.setState({
			isclientval: !isclientval
		});
	};

	handleCommentDescChange = e => {
		this.setState({
			commentval: e.target.value
		});
	};

	handlesavecomments = e => {
		// console.log(e);
		const { commentval, claimID, userid } = this.state;
		const params = {
			claimid: claimID,
			createdby: userid,
			comment: commentval,
			client: false,
			type: 'Manual'
		};
		if (commentval !== '') {
			axios
				.post(`${apiUrl}/api/claim/note/create`, params)
				.then(response => response.data)
				.then(
					result => {
						swal('Comment Created successfully!', {
							icon: 'success'
						}).then(value => {
							this.showclaimlist();
							setTimeout(() => {
								const { workbenchFilterData } = this.state;
								const latestcommentdataset = [...workbenchFilterData].find(
									i => i.claimid === claimID
								).claimcomments;
								this.setState({
									commentsState: latestcommentdataset,
									commentdialoguebox: true,
									showListcommentdiv: true,
									showAddcommentdiv: true,
									commentval: ''
								});
							}, 1000);
						});
					},
					err => {
						console.log(err);
					}
				);
		}
	};

	handlesavenotes = e => {
		// console.log(e);
		const { commentval, claimID, userid } = this.state;
		const params = {
			claimid: claimID,
			createdby: userid,
			comment: commentval,
			client: true,
			type: 'Manual'
		};
		if (commentval !== '') {
			axios
				.post(`${apiUrl}/api/claim/note/create`, params)
				.then(response => response.data)
				.then(
					result => {
						swal('Note Created successfully!', {
							icon: 'success'
						}).then(value => {
							this.showclaimlist();
							setTimeout(() => {
								const { workbenchFilterData } = this.state;
								const latestnotedataset = [...workbenchFilterData].find(
									i => i.claimid === claimID
								).claimnotes;
								this.setState({
									notesState: latestnotedataset,
									notesdialoguebox: true,
									showListnotediv: true,
									showAddnotediv: true,
									commentval: ''
								});
							}, 1000);
						});
					},
					err => {
						console.log(err);
					}
				);
		}
	};

	handleaccordion = id => {
		// console.log(id);
		const { workbenchFilterData, isexpand } = this.state;
		// this.setState({
		// 	accordianid: id,
		// 	isexpand: !isexpand
		// });
		// const isexpantval = {
		// 	expand: !isexpand
		// };
		const copyWorkbenchFilterData = [...workbenchFilterData];
		const tempdatasetIndex = [...copyWorkbenchFilterData].findIndex(i => i.claimid === id);
		copyWorkbenchFilterData[tempdatasetIndex].expand = !copyWorkbenchFilterData[tempdatasetIndex].expand;
		this.setState({
			workbenchFilterData: copyWorkbenchFilterData
		});

		// console.log(tempdataset);
		// for (let i = 0; i < workbenchFilterData.length; i += 1) {
		// 	if (workbenchFilterData[i].claimid === id) {
		// 		workbenchFilterData[i].expand = !isexpand;
		// 	}
		// }
	};

	handleclaimreports = (id, c, docid) => {
		switch (c) {
			case 1:
				this.setState({
					showacceptdialog: true,
					claimID: id,
					currdocid: docid
				});
				break;
			case 2:
				this.setState({
					showrejectdialog: true,
					claimID: id
				});
				break;
			case 3:
				this.setState({
					showholddialog: true,
					claimID: id
				});
				break;
			default:
				break;
		}
	};

	closeacceptdialog = () => {
		this.setState({
			showacceptdialog: false
		});
	};

	closerejectdialog = () => {
		this.setState({
			showrejectdialog: false
		});
	};

	closeholddialog = () => {
		this.setState({
			showholddialog: false
		});
	};

	updateacceptclaimreports = () => {
		const { workbenchFilterData, claimID, userid, currdocid, claimReportReview } = this.state;
		const docstatus = claimReportReview.find(i => i.fieldsubtype === 'Accept').systemfieldid;
		const params = {
			documentid: currdocid,
			status: docstatus,
			actionby: userid,
			reviewtype: 'Accept'
		};
		axios
			.post(`${apiUrl}/api/claim/report//multiplereview`, params)
			.then(response => response.data)
			.then(
				result => {
					console.log(result);
					this.showclaimlist();
					this.closeacceptdialog();
				},
				err => {
					console.log(err);
				}
			);
	};

	updaterejectclaimreports = () => {
		const { workbenchFilterData, claimID, userid, rejectReason, currdocid, claimReportReview } = this.state;
		const docstatus = claimReportReview.find(i => i.fieldsubtype === 'Reject').systemfieldid;
		const params = {
			documentid: currdocid,
			status: docstatus,
			actionby: userid,
			reviewtype: 'Reject',
			rejectreason: rejectReason
		};
		axios
			.post(`${apiUrl}/api/claim/report//multiplereview`, params)
			.then(response => response.data)
			.then(
				result => {
					console.log(result);
					this.showclaimlist();
					this.closerejectdialog();
				},
				err => {
					console.log(err);
				}
			);
	};

	updateholdclaimreports = () => {
		const { workbenchFilterData, claimID, userid, currdocid, claimReportReview } = this.state;
		const docstatus = claimReportReview.find(i => i.fieldsubtype === 'Hold').systemfieldid;
		const params = {
			documentid: currdocid,
			status: docstatus,
			actionby: userid,
			reviewtype: 'Hold'
		};
		axios
			.post(`${apiUrl}/api/claim/report//multiplereview`, params)
			.then(response => response.data)
			.then(
				result => {
					console.log(result);
					this.showclaimlist();
					this.closeholddialog();
				},
				err => {
					console.log(err);
				}
			);
	};

	setRejectReason = e => {
		this.setState({
			rejectReason: e.target.value
		});
	};

	generateInvoicePDF = (claimid, invoiceid) => {
		// this.setState({
		// 	pdfOption: 'dataurlnewwindow'
		// });
		// this.setState({
		// 	pdfOption: 'blob',
		// 	openFrame: true
		// });
		this.getSingleClaim(claimid, invoiceid);
	};

	getSingleClaim = (claimid, invId) => {
		if (claimid) {
			axios
				.get(`${apiUrl}/api/claims/getclaimsbyid/${claimid}`)
				.then(response => response.data)
				.then(
					result => {
						this.getSingleClient(result.data.claimsdata.clientid, invId);
						if (result.data) {
							this.setState({
								claimid: result.data.claimsdata?.claimid || '',
								ryzefilenumber: result.data.claimsdata?.ryzefilenumber || '',
								claimnumber: result.data.claimsdata?.claimnumber || '',
								insaddress1: result.data.address[0]?.address1 || '',
								insaddress2: result.data.address[0]?.address2 || '',
								inscity: result.data.address[0]?.city || '',
								insstate: result.data.address[0]?.state || '',
								inszip: result.data.address[0]?.zip || '',
								policynumber: result.data.claimsdata?.policynumber || ''
							});

							if (result.data.claimsdata?.losstype !== '' && result.data.claimsdata?.losstype !== null) {
								this.setState({
									lossType:
										this.props.systemfields &&
										this.props.systemfields.filter(
											i =>
												i.fieldname.toString().toLowerCase() === 'loss type' &&
												i.systemfieldid === result.data.claimsdata.losstype
										)[0].fieldsubtype
								});
							}

							if (result.data.claimsdata?.lossdate !== '' && result.data.claimsdata?.lossdate !== null) {
								const lDate = result.data.claimsdata.lossdate.split('T');
								this.setState({
									lossDate: lDate[0].replace(/(\d{4})-(\d\d)-(\d\d)/, '$2/$3/$1')
								});
							}

							if (
								result.data.claimsdata?.createddate !== '' &&
								result.data.claimsdata?.createddate !== null
							) {
								const lDate = result.data.claimsdata.createddate.split('T');
								this.setState({
									claimCreatedDate: lDate[0].replace(/(\d{4})-(\d\d)-(\d\d)/, '$2/$3/$1')
								});
							}

							// const adjName =
							// 	result.data.claimsdata.adjustorid &&
							// 	this.adjustors.find(x => x.clientid === result.data.claimsdata.adjustorid);

							// if (adjName !== null && adjName !== '') {
							// 	this.setState({
							// 		adjusterName: `${adjName?.firstname || ''}, ${adjName?.lastname || ''}`
							// 	});
							// } else {
							// 	this.setState({
							// 		adjusterName: ''
							// 	});
							// }
						}
					},
					err => {
						console.log(err);
					}
				);
		}
	};

	getSingleClient = (clientid, invId) => {
		axios
			.get(`${apiUrl}/api/clients/${clientid}`)
			.then(response => response.data)
			.then(
				r => {
					if (r.data) {
						this.getInvoiceSystemfieldData(invId);
						this.setState({
							// cName: this.getClientName(r.data.clientdetails[0]),
							clientaddress1: r.data.addressdetails[0]?.address1 || '',
							clientaddress2: r.data.addressdetails[0]?.address2 || '',
							clientcity: r.data.addressdetails[0]?.city || '',
							clientstate: r.data.addressdetails[0]?.state || '',
							clientzip: r.data.addressdetails[0]?.zip || ''
						});
					}
				},
				err => {
					console.log(err);
				}
			);
	};

	getInvoiceSystemfieldData = invoiceid => {
		axios
			.get(`${apiUrl}/api/invoice/invoicedefaultfields`)
			.then(response => response.data)
			.then(
				result => {
					this.getinvoicedetailsdata(invoiceid);
					if (result.data) {
						this.setState({
							productdata: result.data.productdata
						});
					}
				},
				err => {
					console.log(err);
				}
			);
	};

	getinvoicedetailsdata = invoiceid => {
		if (invoiceid) {
			axios
				.get(`${apiUrl}/api/invoice/invoice/${invoiceid}`)
				.then(response => response.data)
				.then(
					result => {
						if (result.data) {
							this.invnumber = result.data.invoicesummarydata[0]?.invoicenumber;
							this.setState({
								invoicedetailsdata: result.data.invoicedetailsdata,
								taxamount: result.data.invoicesummarydata[0]?.taxamount,
								total: result.data.invoicesummarydata[0]?.total,
								invoiceNumber: result.data.invoicesummarydata[0]?.invoicenumber,
								reviewedbyname: result.data.invoicesummarydata[0]?.reviewedbyname
							});

							if (
								result.data.invoicesummarydata[0]?.createddate !== '' &&
								result.data.invoicesummarydata[0]?.createddate !== null
							) {
								const lDate = result.data.invoicesummarydata[0].createddate.split('T');
								this.setState({
									invoiceDate: lDate[0].replace(/(\d{4})-(\d\d)-(\d\d)/, '$2/$3/$1')
								});
							}
							invLineData = [];
							invLineItems = [];
							const pData = this.state.productdata;
							const invoiceLineItems = this.state.invoicedetailsdata;
							if (invoiceLineItems.length > 0) {
								invoiceLineItems.forEach(f => {
									const prdName = pData.filter(p => p.productid === f.productid)[0].name;
									const { description, qty, cost } = f;

									const quantity = (Math.round(qty * 100) / 100).toFixed(2);
									const rate = (Math.round(cost * 100) / 100).toFixed(3);
									const totalAmt = (Math.round(qty * cost * 100) / 100).toFixed(2);
									invLineData.push({ prdName, description, quantity, rate, totalAmt });
								});
							}
							invLineData.forEach(data => {
								const tempArr = [];
								tempArr.push(data.prdName, data.description, data.quantity, data.rate, data.totalAmt);
								invLineItems.push(tempArr);
							});

							const pdfProps = {
								outputType: this.state.pdfOption,
								returnJsPDFDocObject: true,
								fileName:
									this.state.attachmentName !== '' ? `Invoice_${invoiceid}` : `Invoice_${invoiceid}`,
								orientationLandscape: false,
								logo: {
									src: 'assets/images/invoice/pdf_logo.png',
									width: 53.33, // aspect ratio = width/height
									height: 26.66,
									margin: {
										top: 0, // negative or positive num, from the current position
										left: 0 // negative or positive num, from the current position
									}
								},
								business: {
									name: 'Ryze Claim Solutions',
									address: 'P.O. Box 1140',
									address_1: 'Noblesville, IN 46061-1140',
									phone: 'Phone: 877-839-8152',
									phone_1: 'Toll Free: 888-703-1777',
									fax: 'Fax: 877-839-8151'
								},
								contact: {
									companyName: this.state?.cName || '',
									contactNameLabel: 'ATTENTION:',
									name: this.state?.cName || '',
									address: this.state?.clientaddress1 || '',
									address2: this.state?.clientaddress2 || '',
									otherIfo: `${this.state.clientcity} ${this.state.clientcity !== '' ? ',' : ''} 
									   ${this.state.clientstate} ${this.state.clientzip}`
								},
								invoice: {
									label: 'INVOICE #: ',
									num: this.state?.invoiceNumber.toString() || '',
									invRecDateLabel: 'DATE RECEIVED:',
									claimCreatedDate: this.state?.claimCreatedDate || '',
									invDateLabel: 'INVOICE DATE:',
									invDate: this.state.invoiceDate,
									headerBorder: false,
									tableBodyBorder: false,
									headerlabel: 'BILLABLE ITEMS :',
									header: ['ITEM', 'Description', 'QTY', 'RATE', 'PRICE'],
									table: invLineItems,
									row1: {
										col1: 'TAX:',
										col2: `$${(Math.round(this.state?.taxamount * 100) / 100).toFixed(2)}`,
										col3: '',
										style: {
											fontSize: 9,
											letterspacing: 1
										}
									},
									invTotalLabel: 'PAY THIS AMOUNT:',
									invTotal: `$${(Math.round(this.state?.total * 100) / 100).toFixed(2)}`,
									invDescLabel: 'Notes:',
									invDesc: ''
								},
								claim: {
									header: 'CLAIM INFORMATION',
									lossNameLabel: 'LOSS:',
									name: 'Carolyn Linder',
									address: this.state?.insaddress1 || '',
									address_2: this.state?.insaddress2 || '',
									cityStateZip: `${this.state.inscity} ${this.state.inscity !== '' ? ',' : ''} ${
										this.state.insstate
									} ${this.state.inszip}`,
									yourFileLabel: 'YOUR FILE #:',
									yourFileNumber: this.state?.claimnumber || '',
									ourFileLabel: 'OUR FILE #:',
									ourFileNumber: this.state?.ryzefilenumber || '',
									lossDateLabel: 'LOSS DATE:',
									lossDate: this.state?.lossDate || '',
									lossTypeLabel: 'LOSS TYPE:',
									LossType: this.state?.lossType || '',
									otherLabel_1: 'RCV:',
									otherLabel_num_1: '0.00',
									otherLabel_2: 'ACV:',
									otherLabel_num_2: '0.00',
									adjusterLabel: 'ADJUSTER:',
									adjusterName: this.state?.adjusterName || ''
								},
								policy: {
									policyLabelName: 'POLICY #:',
									policyNumber: this.state?.policynumber || ''
								},
								remit: {
									reviewlabel: 'Reviewed by ',
									reviewname: this.state?.reviewedbyname || '',
									remitlabel: 'Please remit to:',
									remitto: 'Ryze Claim Solutions',
									remittoaddress_1: 'P.O. Box 1140',
									remittoaddress_2: 'Noblesville, IN. 46061-1140',
									remittoaddress_3: '',
									einlabel: 'Our EIN Number is:',
									einnumber: '35-2072320',
									query: 'If you have any questions on payments, feel free to call our office at 877-839-8152. We appreciate the opportunity to be of service.'
								},
								footer: {
									text: ''
								}
							};
							const getOption = jsPDFWBInvoiceTemplate(pdfProps);
							if (this.state.pdfOption === 'blob') {
								const myBlob = getOption.blob;
								// to open in iframe
								const blobUrl = URL.createObjectURL(myBlob);
								iframeSrc = blobUrl;
								// window.open(blobUrl);

								this.getBase64(myBlob).then(data => {
									if (data !== undefined) {
										const base64File = data.split(',');
										this.setState({
											base64Data: base64File[1],
											attachmentName: `${pdfProps.fileName}.pdf`
										});
									}
								});
							}
						}
					},
					err => {
						console.log(err);
					}
				);
		}
	};

	getBase64 = async file => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result);
			reader.onerror = error => reject(error);
		});
	};

	render() {
		// const classes = useStyles;
		const {
			error,
			horizontal,
			infoopen,
			infomsg,
			showHideAdd,
			showHideDelete,
			showHideEdit,
			showHideView,
			showHideList,
			rowData,
			showclaimlistb,
			examiner,
			examiners,
			adjuster,
			adjusters,
			client,
			clients,
			claimtype,
			claimtypes,
			assignmenttype,
			assignmenttypes,
			examinersList,
			adjustersList,
			clientsList,
			notinspectedList,
			notcontactedList,
			lateList,
			notinspected,
			notcontacted,
			late,
			states,
			stateList,
			ryzefilenumber,
			ryzefileList,
			claimnumber,
			claimnumberList,
			workbenchFilterData,
			emptyclaims,
			showcommentdialog,
			showAddcommentdiv,
			showListcommentdiv,
			showAddnotediv,
			showListnotediv,
			receiveddate,
			assigneddate,
			contactedate,
			claimcomments,
			commentval,
			isclientval,
			commentsState,
			notesState,
			accordianid,
			showacceptdialog,
			showrejectdialog,
			showholddialog,
			rejectReason,
			isexpand,
			fwc
		} = this.state;
		const { classes } = this.props;
		if (error) {
			return <div>Error:{error.message}</div>;
		}
		return (
			<div className="w-full h-full ps background-wh p-16" style={{ width: '100%', height: '100%' }}>
				<Helmet>
					<meta charSet="utf-8" />
					<title>Workbench</title>
					<meta name="description" content="Ryze Claims" />
				</Helmet>

				<div>
					<div className="w-full">
						<div className="p-4" style={{ marginBottom: '-30px', float: 'left' }}>
							{/* <h2>Claims</h2> */}
						</div>
						<ul className="tabs tab-panel-worbench">
							<li id="current">
								<button type="button">Workbench</button>
							</li>
						</ul>
						{/* <div className="tab-panel">
							<div className="tabmerge">
								<div
									style={{ display: 'flex', marginBottom: '15px', float: 'right', clear: 'both' }}
									className="search"
								>
									fdsfsdf
								</div>
							</div>
						</div> */}
						<div className="pb-12 pt-0 h-i320 box-eff">
							<Grid
								container
								className="gridcss newGridCss"
								spacing={{ xs: 2, md: 2 }}
								columns={{ xs: 4, sm: 8, md: 12 }}
							>
								<div className="gridcss newGridCss setsizecss wrapper">
									<Paper elevation={3} style={{ margin: '10px' }} className="gridcss newGridCss">
										<Card className="gridcss newGridCss">
											<CardContent>
												<div className="flex flex-col">
													<div className="flex flex-row">
														<div>
															<FormControl
																variant="outlined"
																style={{ width: '50%', paddingBottom: '10px' }}
																className=" input-placeholder"
															>
																<Autocomplete
																	value={examiner}
																	options={examinersList && examinersList}
																	// disabled={isLocked || !iseditclaim}
																	getOptionLabel={option =>
																		option.firstname && option.firstname !== ''
																			? `${option.firstname} ${option.lastname}`
																			: option.companyname &&
																			  option.companyname !== ''
																			? `${option.companyname}`
																			: ''
																	}
																	renderOption={option => (
																		<>
																			{option.firstname && option.firstname !== ''
																				? `${option.firstname} ${option.lastname}`
																				: option.companyname !== ''
																				? `${option.companyname}`
																				: ''}
																		</>
																	)}
																	// disabled={isLocked}
																	fullWidth
																	style={{ width: '200px', marginRight: '10px' }}
																	className="dropdown-color"
																	size="small"
																	onChange={(event, newValue) => {
																		if (newValue !== null) {
																			this.setState({
																				examiner: newValue
																			});
																		} else {
																			this.setState({
																				examiner: ''
																			});
																		}
																	}}
																	onKeyUp={this.onSearchClient}
																	renderInput={params => (
																		<TextField
																			{...params}
																			name="examiners"
																			label="Examiner"
																			variant="outlined"
																		/>
																	)}
																/>
															</FormControl>
														</div>
														<div>
															<FormControl
																variant="outlined"
																style={{ width: '50%', paddingBottom: '10px' }}
																className="  input-placeholder"
															>
																<Autocomplete
																	value={adjuster}
																	options={adjustersList && adjustersList}
																	// disabled={isLocked || !iseditclaim}
																	getOptionLabel={option =>
																		option.firstname && option.firstname !== ''
																			? `${option.firstname} ${option.lastname}`
																			: option.companyname &&
																			  option.companyname !== ''
																			? `${option.companyname}`
																			: ''
																	}
																	renderOption={option => (
																		<>
																			{option.firstname && option.firstname !== ''
																				? `${option.firstname} ${option.lastname}`
																				: option.companyname !== ''
																				? `${option.companyname}`
																				: ''}
																		</>
																	)}
																	onChange={(event, newValue) => {
																		if (newValue !== null) {
																			this.setState({
																				adjuster: newValue
																			});
																		} else {
																			this.setState({
																				adjuster: ''
																			});
																		}
																	}}
																	onKeyUp={this.onSearchClient}
																	className="dropdown-color"
																	style={{ width: '200px', marginRight: '10px' }}
																	fullWidth
																	size="small"
																	renderInput={params => (
																		<TextField
																			{...params}
																			name="adjusters"
																			label="Adjuster"
																			variant="outlined"
																		/>
																	)}
																/>
															</FormControl>
														</div>
														<div>
															<FormControl
																variant="outlined"
																style={{ width: '50%', paddingBottom: '10px' }}
																className=" input-placeholder"
															>
																<Autocomplete
																	value={client}
																	options={clientsList && clientsList}
																	// disabled={isLocked || !iseditclaim}
																	getOptionLabel={option =>
																		option.firstname && option.firstname !== ''
																			? `${option.firstname} ${option.lastname}`
																			: option.companyname &&
																			  option.companyname !== ''
																			? `${option.companyname}`
																			: ''
																	}
																	renderOption={option => (
																		<>
																			{option.firstname && option.firstname !== ''
																				? `${option.firstname} ${option.lastname}`
																				: option.companyname !== ''
																				? `${option.companyname}`
																				: ''}
																		</>
																	)}
																	className="dropdown-color"
																	onChange={(event, newValue) => {
																		if (newValue !== null) {
																			this.setState({
																				client: newValue
																			});
																		} else {
																			this.setState({
																				client: ''
																			});
																		}
																	}}
																	onKeyUp={this.onSearchClient}
																	style={{ width: '200px', marginRight: '10px' }}
																	fullWidth
																	size="small"
																	renderInput={params => (
																		<TextField
																			{...params}
																			name="clients"
																			label="Client"
																			variant="outlined"
																		/>
																	)}
																/>
															</FormControl>
														</div>
														<div>
															<FormControl
																variant="outlined"
																style={{ width: '50%', paddingBottom: '10px' }}
																className=" input-placeholder"
															>
																<Autocomplete
																	name="claimtype"
																	value={claimtype}
																	options={claimtypes && claimtypes}
																	// disabled={isLocked || !iseditclaim}
																	getOptionLabel={option =>
																		option.fieldsubtype ? option.fieldsubtype : ''
																	}
																	onChange={(event, newValue) => {
																		if (newValue !== null) {
																			this.setState({
																				claimtype: newValue
																			});
																		} else {
																			this.setState({
																				claimtype: ''
																			});
																		}
																	}}
																	className="dropdown-color"
																	style={{ width: '200px', marginRight: '10px' }}
																	fullWidth
																	size="small"
																	renderInput={params => (
																		<TextField
																			{...params}
																			label="Claim Type"
																			variant="outlined"
																		/>
																	)}
																/>
															</FormControl>
														</div>
														<div>
															<FormControl
																variant="outlined"
																style={{ width: '50%', paddingBottom: '10px' }}
																className="  input-placeholder"
															>
																<Autocomplete
																	name="assignmenttype"
																	value={assignmenttype}
																	options={assignmenttypes && assignmenttypes}
																	// disabled={isLocked || !iseditclaim}
																	getOptionLabel={option =>
																		option.fieldsubtype ? option.fieldsubtype : ''
																	}
																	onChange={(event, newValue) => {
																		if (newValue !== null) {
																			this.setState({
																				assignmenttype: newValue
																			});
																		} else {
																			this.setState({
																				assignmenttype: ''
																			});
																		}
																	}}
																	className="dropdown-color"
																	style={{ width: '200px', marginRight: '10px' }}
																	fullWidth
																	size="small"
																	renderInput={params => (
																		<TextField
																			{...params}
																			label="Assignment Type"
																			variant="outlined"
																		/>
																	)}
																/>
															</FormControl>
														</div>
														<div>
															<FormControl
																variant="outlined"
																style={{ width: '50%', paddingBottom: '10px' }}
																className="input-placeholder"
															>
																<Autocomplete
																	name="notcontacted"
																	value={notcontacted}
																	options={notcontactedList && notcontactedList}
																	// disabled={isLocked || !iseditclaim}
																	getOptionLabel={option =>
																		option.fieldsubtype ? option.fieldsubtype : ''
																	}
																	onChange={(event, newValue) => {
																		this.handlecontacteddatecompare(
																			event,
																			newValue
																		);
																	}}
																	className="dropdown-color"
																	style={{ width: '200px', marginRight: '10px' }}
																	fullWidth
																	size="small"
																	renderInput={params => (
																		<TextField
																			{...params}
																			label="Not Contacted"
																			variant="outlined"
																		/>
																	)}
																/>
															</FormControl>
														</div>
													</div>
													<div className="flex flex-row searchparentbtw">
														<div className="searchbtnresetbtn">
															<div>
																<FormControl
																	variant="outlined"
																	style={{ width: '50%', paddingBottom: '10px' }}
																	className="input-placeholder"
																>
																	<Autocomplete
																		name="notinspected"
																		value={notinspected}
																		options={notinspectedList && notinspectedList}
																		// disabled={isLocked || !iseditclaim}
																		getOptionLabel={option =>
																			option.fieldsubtype
																				? option.fieldsubtype
																				: ''
																		}
																		onChange={(event, newValue) => {
																			this.handleinspecteddatecompare(
																				event,
																				newValue
																			);
																		}}
																		className="dropdown-color"
																		style={{ width: '200px', marginRight: '10px' }}
																		fullWidth
																		size="small"
																		renderInput={params => (
																			<TextField
																				{...params}
																				label="Not Inspected"
																				variant="outlined"
																			/>
																		)}
																	/>
																</FormControl>
															</div>
															<div>
																<FormControl
																	variant="outlined"
																	style={{ width: '50%', paddingBottom: '10px' }}
																	className="input-placeholder"
																>
																	<Autocomplete
																		name="late"
																		value={late}
																		options={lateList && lateList}
																		// disabled={isLocked || !iseditclaim}
																		getOptionLabel={option =>
																			option.fieldsubtype
																				? option.fieldsubtype
																				: ''
																		}
																		onChange={(event, newValue) => {
																			this.handlelatedatecompare(event, newValue);
																		}}
																		className="dropdown-color"
																		style={{ width: '200px', marginRight: '10px' }}
																		fullWidth
																		size="small"
																		renderInput={params => (
																			<TextField
																				{...params}
																				label="Late"
																				variant="outlined"
																			/>
																		)}
																	/>
																</FormControl>
															</div>
															<div>
																<FormControl
																	variant="outlined"
																	style={{ width: '50%', paddingBottom: '10px' }}
																	className="input-placeholder"
																>
																	<Autocomplete
																		name="states"
																		value={states}
																		options={stateList && stateList}
																		// disabled={isLocked || !iseditclaim}
																		getOptionLabel={option =>
																			option.state ? option.state : ''
																		}
																		onChange={(event, newValue) => {
																			this.handlestatechange(event, newValue);
																		}}
																		className="dropdown-color"
																		style={{ width: '200px', marginRight: '10px' }}
																		fullWidth
																		size="small"
																		renderInput={params => (
																			<TextField
																				{...params}
																				label="State"
																				variant="outlined"

																				// error={eventError}
																				// helperText={eventError}
																			/>
																		)}
																	/>
																</FormControl>
															</div>
															<div>
																<FormControl
																	variant="outlined"
																	style={{ width: '50%', paddingBottom: '10px' }}
																	className="input-placeholder"
																>
																	<Autocomplete
																		name="ryzefilenumber"
																		value={ryzefilenumber}
																		options={ryzefileList && ryzefileList}
																		// disabled={isLocked || !iseditclaim}
																		getOptionLabel={option =>
																			option.ryzefilenumber
																				? option.ryzefilenumber
																				: ''
																		}
																		onKeyUp={this.onSearchRyzeFileNumber}
																		onChange={(event, newValue) => {
																			if (newValue !== null) {
																				this.setState({
																					ryzefilenumber: newValue
																				});
																			} else {
																				this.setState({
																					ryzefilenumber: ''
																				});
																			}
																		}}
																		className="dropdown-color"
																		style={{ width: '200px', marginRight: '10px' }}
																		fullWidth
																		size="small"
																		renderInput={params => (
																			<TextField
																				{...params}
																				label="File Number"
																				variant="outlined"
																			/>
																		)}
																	/>
																</FormControl>
															</div>
															<div>
																<FormControl
																	variant="outlined"
																	style={{ width: '50%', paddingBottom: '10px' }}
																	className="input-placeholder"
																>
																	<Autocomplete
																		name="claimnumber"
																		value={claimnumber}
																		options={claimnumberList && claimnumberList}
																		// disabled={isLocked || !iseditclaim}
																		getOptionLabel={option =>
																			option.claimnumber ? option.claimnumber : ''
																		}
																		onKeyUp={this.onSearchClaimNumber}
																		onChange={(event, newValue) => {
																			if (newValue !== null) {
																				this.setState({
																					claimnumber: newValue
																				});
																			} else {
																				this.setState({
																					claimnumber: ''
																				});
																			}
																		}}
																		className="dropdown-color"
																		style={{ width: '200px', marginRight: '10px' }}
																		fullWidth
																		size="small"
																		renderInput={params => (
																			<TextField
																				{...params}
																				label="Claim Number"
																				variant="outlined"

																				// error={eventError}
																				// helperText={eventError}
																			/>
																		)}
																	/>
																</FormControl>
															</div>
															<div>
																<ValidatorForm
																// onSubmit={this.handleSave}
																// onError={errors => console.log(errors)}
																>
																	<TextValidator
																		className="mb-16 pr-10"
																		label="FWC"
																		select
																		size="small"
																		name="fwc"
																		value={fwc}
																		onChange={e => this.handlefwcchange(e)}
																		variant="outlined"
																		fullWidth
																		style={{ width: '210px', marginRight: '10px' }}
																		validators={['required']}
																		errorMessages={['This field is required']}
																		InputProps={{
																			classes: {
																				notchedOutline: classes.notchedOutline,
																				root: classes.cssOutlinedInput,
																				focused: classes.cssFocused
																			}
																		}}
																		InputLabelProps={{
																			classes: {
																				root: classes.cssLabel,
																				focused: classes.cssFocused
																			},
																			shrink: true
																		}}
																		SelectProps={{
																			native: true,
																			classes: {
																				icon: classes.iconColor
																			}
																		}}
																	>
																		<option key="Select" value="Select">
																			Select
																		</option>
																		<option key="Yes" value="Yes">
																			Yes
																		</option>
																		<option key="No" value="No">
																			No
																		</option>
																		<option key="All" value="All">
																			All
																		</option>
																	</TextValidator>
																</ValidatorForm>
															</div>
														</div>
														<div>
															<Button
																style={{ marginRight: '20px', width: '100px' }}
																variant="contained"
																color="primary"
																className="w-150 mb-16 btn-shadow btn-outline-primary justify-center"
																aria-label="Register"
																onClick={this.handlesearch}
																// disabled={this.state.disabled}
															>
																Search
															</Button>

															<Button
																variant="contained"
																style={{ width: '100px' }}
																color="primary"
																className="w-160 mb-16 btn-shadow btn-outline-primary justify-center"
																aria-label="Register"
																type="button"
																onClick={this.handlereset}
															>
																Reset
															</Button>
														</div>
													</div>
												</div>
											</CardContent>
										</Card>
									</Paper>
								</div>
							</Grid>
						</div>
						<div
							style={{ height: 'calc(100% - 25px)', clear: 'both', marginTop: '10px' }}
							className={`${!showclaimlistb ? 'hidelist' : ''}`}
						>
							{showHideList && (
								<>
									<div
										className={classes.root}
										style={{
											marginTop: '20px'
										}}
									>
										{workbenchFilterData.map((ins, index1) => (
											<Accordion style={{ marginBottom: '10px' }} expanded={ins.expand}>
												<AccordionSummary
													expandIcon={<ExpandMoreIcon />}
													aria-controls="panel1a-content"
													id="panel1a-header"
													style={{ border: '1px solid grey' }}
													className="accordarrow removeborderbottom"
													onClick={e => this.handleaccordion(ins.claimid)}
												>
													<Typography className={classes.heading}>
														<span style={{ paddingRight: '10px' }}>
															<span className="accHead">Ryze File Number : </span>
															<input
																value={ins.ryzefilenumber}
																type="button"
																style={{
																	cursor: 'pointer',
																	backgroundColor: 'white',
																	fontSize: '16px',
																	color: 'rgb(48,177,255)'
																}}
																className="hover:underline"
																onClick={e =>
																	this.updateclaim(ins.claimid, ins.policynumber)
																}
															/>
														</span>
														<span style={{ paddingRight: '10px' }}>
															{' '}
															<span className="accHead">Claim Number : </span>
															<span
																style={{
																	fontSize: '16px'
																}}
															>
																{ins.claimnumber}
															</span>
														</span>
														<span style={{ paddingRight: '10px' }}>
															{' '}
															<span className="accHead">Policy Number : </span>{' '}
															<span
																style={{
																	fontSize: '16px'
																}}
															>
																{ins.policynumber}
															</span>
														</span>
														<span style={{ paddingRight: '10px', fontSize: '16px' }}>
															<span className="accHead">Created on : </span>
															{moment(ins.createddate).format('MM/DD/YYYY, HH:mm')}
															{ins.createdbyname
																? ` by ${ins.createdbyname}`
																: ins.createdbycompanyname &&
																  ` by ${ins.createdbycompanyname}`}
														</span>
													</Typography>
												</AccordionSummary>
												<div
													style={{
														// boxShadow: '5px 5px 5px grey',
														margin: '1px',
														backgroundColor: '#f7f7f7',
														border: '1px solid grey'
													}}
													className="removebordertop"
												>
													<Typography>
														<div className="pr-5">
															<table width="100%">
																<tr>
																	{/* <th className="searchheading" width="25%">
																		Client/ Insured Info
																	</th>
																	<th className="searchheading" width="25%">
																		Cycle Time Info and Comments / Notes
																	</th>
																	<th className="searchheading" width="50%">
																		Reports / Invoices
																	</th> */}
																</tr>

																<tr>
																	<td width="18%">
																		<div className="flex flex-col pl-6 ">
																			<div
																				style={{
																					paddingBottom: '5px'
																				}}
																			/>
																			<div
																				style={{
																					// border: '1px solid grey',
																					padding: '5px',
																					marginBottom: '10px',
																					// boxShadow: '5px 5px 5px grey',
																					backgroundColor: 'white',
																					height: '158px'
																				}}
																			>
																				<div>
																					<div
																						style={{ textAlign: 'center' }}
																					>
																						<b>Client Info</b>
																						<div
																							style={{
																								borderBottom:
																									'1px solid grey',
																								marginBottom: '8px'
																							}}
																						/>
																					</div>

																					<p>
																						{ins.clientname !== null &&
																							`${ins.clientname}`}
																					</p>
																				</div>
																				<div>
																					<p>
																						<b>Account Executive : </b>
																						{ins.accountexecutivefirstname &&
																						ins.accountexecutivelastname
																							? `${ins.accountexecutivefirstname} 
																								  ${ins.accountexecutivelastname}`
																							: `${
																									ins.accountexecutivecompanyname
																										? ins.accountexecutivecompanyname
																										: ''
																							  }`}
																					</p>
																					<p>
																						<b>Examiner : </b>
																						{ins.examinerfirstname &&
																						ins.examinerlastname
																							? `${ins.examinerfirstname} 
																								  ${ins.examinerlastname}`
																							: `${
																									ins.examinercompanyname
																										? ins.examinercompanyname
																										: ''
																							  }`}
																					</p>
																					<p>
																						<b>Adjuster : </b>
																						{ins.adjusterfirstname &&
																						ins.adjusterlastname
																							? `${ins.adjusterfirstname} 
																								  ${ins.adjusterlastname}`
																							: `${
																									ins.adjustercompanyname
																										? ins.adjustercompanyname
																										: ''
																							  }`}
																					</p>
																				</div>

																				<div style={{ paddingBottom: '10px' }}>
																					<p>
																						<b>Delay Reason : </b>
																					</p>
																				</div>
																			</div>
																			<div
																				style={{
																					// border: '1px solid grey',
																					padding: '5px',
																					// boxShadow: '5px 5px 5px grey',
																					backgroundColor: 'white'
																				}}
																			>
																				<div style={{ textAlign: 'center' }}>
																					<b>Cycle Time Info</b>
																					<div
																						style={{
																							borderBottom:
																								'1px solid grey',
																							marginBottom: '8px'
																						}}
																					/>
																				</div>

																				<div>
																					{ins.claimprogressactivitydataset && (
																						<>
																							{ins.claimprogressactivitydataset.map(
																								(cpa, cpaindex) => (
																									<>
																										{cpa.claimprogressstatus && (
																											<>
																												<p>
																													<b>
																														{cpa.activitytype
																															.replace(
																																'Date',
																																' '
																															)
																															.search(
																																'Task'
																															) <
																														0
																															? cpa.activitytype.replace(
																																	'Date',
																																	' '
																															  )
																															: cpa.activitytype
																																	.replace(
																																		'Date',
																																		' '
																																	)
																																	.replace(
																																		'Task',
																																		' '
																																	)}

																														:{' '}
																													</b>
																													{moment(
																														cpa.datetime
																													).format(
																														'MM/DD/YYYY, HH:mm'
																													)}
																												</p>
																											</>
																										)}
																									</>
																								)
																							)}
																						</>
																					)}
																					<p>
																						{ins.cycletime ? (
																							<b>Cycle Time : </b>
																						) : (
																							''
																						)}
																						{ins.cycletime
																							? `${ins.cycletime} days`
																							: ''}
																					</p>
																					<p>
																						<b>Activity Due : </b>
																					</p>
																					<p>
																						<b>Internal Contact : </b>
																					</p>
																				</div>
																			</div>
																		</div>
																	</td>

																	<td width="22%">
																		<div className="flex flex-col">
																			<div
																				style={{
																					paddingBottom: '5px'
																				}}
																			/>
																			<div
																				style={{
																					// border: '1px solid grey',
																					padding: '5px',
																					// boxShadow: '5px 5px 5px grey',
																					backgroundColor: 'white'
																				}}
																				className="flex flex-col"
																			>
																				<div
																					style={{
																						textAlign: 'center'
																					}}
																				>
																					<b>Comments & Notes</b>
																					<div
																						style={{
																							borderBottom:
																								'1px solid grey',
																							marginBottom: '8px'
																						}}
																					/>
																				</div>
																				<b> Latest Comment</b>
																				{ins.claimcomments &&
																					ins.claimcomments.map(
																						(cc, index12) =>
																							index12 === 0 ? (
																								<p className="latestcommentcss">
																									{cc.comment}
																								</p>
																							) : (
																								''
																							)
																					)}

																				<button
																					type="button"
																					style={{
																						cursor: 'pointer',
																						color: 'rgb(48,177,255)'
																					}}
																					className="comments-css"
																					onClick={e =>
																						this.handlecommentdialogopen(
																							ins.claimid
																						)
																					}
																				>
																					Add/View All Comments
																				</button>

																				<b>Latest Note</b>
																				{ins.claimnotes &&
																					ins.claimnotes.map((cc, index12) =>
																						index12 === 0 ? (
																							<p className="latestcommentcss">
																								{cc.comment}
																							</p>
																						) : (
																							''
																						)
																					)}
																				<button
																					type="button"
																					style={{
																						cursor: 'pointer',
																						color: 'rgb(48,177,255)'
																					}}
																					className="comments-css"
																					onClick={e =>
																						this.handlenotesdialogopen(
																							ins.claimid
																						)
																					}
																				>
																					Add/View All Notes
																				</button>
																			</div>
																			<div
																				style={{
																					paddingBottom: '10px'
																				}}
																			/>
																			{ins.fullname ? (
																				<div
																					style={{
																						// 	border: '1px solid grey',
																						padding: '5px',
																						// boxShadow: '5px 5px 5px grey',
																						backgroundColor: 'white'
																					}}
																				>
																					<div
																						style={{ textAlign: 'center' }}
																					>
																						<b>Insured Info</b>
																						<div
																							style={{
																								borderBottom:
																									'1px solid grey',
																								marginBottom: '8px'
																							}}
																						/>
																					</div>
																					<div>
																						<b>{ins.fullname}</b>
																					</div>
																					<div>
																						<p>{ins.address1}</p>
																						<p>{ins.city}</p>
																						<p>
																							{ins.state
																								? `${ins.state}, ${ins.zip}`
																								: ''}
																						</p>
																					</div>
																				</div>
																			) : (
																				''
																			)}
																		</div>
																	</td>

																	<td width="60%">
																		<div
																			style={{
																				// border: '1px solid grey',
																				padding: '5px',
																				overflowY: 'scroll',
																				maxHeight: '382px',
																				// boxShadow: '5px 5px 5px grey',
																				marginTop: '6px',
																				backgroundColor: 'white'
																			}}
																		>
																			<div
																				style={{
																					textAlign: 'center'
																				}}
																			>
																				<b>Reports & Invoices</b>
																				<div
																					style={{
																						borderBottom: '1px solid grey',
																						marginBottom: '8px'
																					}}
																				/>
																			</div>
																			<table
																				className="reportsTable"
																				width="100%"
																			>
																				<tr className="reportsTable">
																					<th className="reportheading reportsTable">
																						Report
																					</th>
																					<th className="reportheading reportsTable">
																						Submitted On
																					</th>
																					<th className="reportheading reportsTable">
																						Reviewed On
																					</th>
																					<th className="reportheading reportsTable">
																						Status
																					</th>
																					<th className="reportheading reportsTable">
																						Action
																					</th>
																				</tr>
																				{ins.claimreports.length > 0 ||
																				ins.claiminvoices.length > 0 ? (
																					ins.claimreports.map(
																						(cr, index3) => (
																							<tr>
																								<td className="reportsTable">
																									<p>
																										{cr.description}
																									</p>
																								</td>
																								<td className="reportsTable">
																									<p>
																										{moment(
																											cr.createddate
																										).format(
																											'MM/DD/YYYY, HH:mm'
																										)}
																									</p>
																								</td>
																								<td className="reportsTable">
																									<p>
																										{cr.fieldsubtype ===
																											'Hold' ||
																										cr.fieldsubtype ===
																											null
																											? 'Waiting for review'
																											: moment(
																													cr.actionon
																											  ).format(
																													'MM/DD/YYYY, HH:mm'
																											  )}
																									</p>
																								</td>
																								<td className="reportsTable">
																									{cr.fieldsubtype ===
																										'Accept' && (
																										<button
																											type="button"
																											className="approved_workbench"
																										>
																											Approved
																										</button>
																									)}
																									{cr.fieldsubtype ===
																										'Reject' && (
																										<button
																											type="button"
																											className="reject_workbench"
																										>
																											Rejected
																										</button>
																									)}
																									{/* {cr.rejectedby ===
																										null &&
																										cr.acceptedby ===
																											null &&
																										cr.reviewedby ===
																											null && (
																											<button
																												type="button"
																												className="waiting_workbench"
																											>
																												Waiting
																												for
																												review
																											</button>
																										)} */}
																								</td>
																								<td className="reportsTable">
																									{cr.fieldsubtype !==
																										'Accept' &&
																										cr.fieldsubtype !==
																											'Reject' && (
																											<div className="flex flex-row">
																												<div
																													className="flex flex-row"
																													style={{
																														color: 'green'
																													}}
																												>
																													<Tooltip title="Accept">
																														<CheckIcon
																															style={{
																																fontSize:
																																	'20px',
																																fontWeight:
																																	'bolder',
																																cursor: 'pointer'
																															}}
																															onClick={e =>
																																this.handleclaimreports(
																																	ins.claimid,
																																	1,
																																	cr.documentid
																																)
																															}
																														/>
																													</Tooltip>
																												</div>
																												<div
																													className="flex flex-row"
																													style={{
																														color: 'red'
																													}}
																												>
																													<Tooltip title="Reject">
																														<CloseIcon
																															style={{
																																fontSize:
																																	'20px',
																																fontWeight:
																																	'bolder',
																																cursor: 'pointer'
																															}}
																															onClick={e =>
																																this.handleclaimreports(
																																	ins.claimid,
																																	2
																																)
																															}
																														/>
																													</Tooltip>
																												</div>
																												<div className="flex flex-row">
																													{' '}
																													<Tooltip title="Hold">
																														<PanToolIcon
																															style={{
																																fontSize:
																																	'20px',
																																fontWeight:
																																	'bolder',
																																color: 'grey',
																																cursor: 'pointer'
																															}}
																															onClick={e =>
																																this.handleclaimreports(
																																	ins.claimid,
																																	3
																																)
																															}
																														/>
																													</Tooltip>
																												</div>
																											</div>
																										)}
																								</td>
																							</tr>
																						)
																					)
																				) : (
																					<tr>
																						<td
																							colSpan="4"
																							className="reportsTable"
																						>
																							<p
																								style={{
																									textAlign: 'center'
																								}}
																							>
																								No Reports/ Invoices to
																								show
																							</p>
																						</td>
																					</tr>
																				)}
																				{ins.claiminvoices.length > 0
																					? ins.claiminvoices.map(
																							(civ, ind4) => (
																								<tr>
																									<td className="reportsTable">
																										<p>
																											<b>
																												Invoice
																											</b>
																										</p>
																										<p>
																											{civ.notes}
																										</p>
																										<button
																											onClick={e =>
																												this.generateInvoicePDF(
																													ins.claimid,
																													civ.invoiceid
																												)
																											}
																											type="button"
																											style={{
																												cursor: 'pointer',
																												color: 'rgb(48,177,255)'
																											}}
																											className="comments-css"
																										>
																											InvoiceId_
																											{
																												civ.invoiceid
																											}
																											.pdf
																										</button>
																									</td>
																									<td className="reportsTable">
																										{moment(
																											civ.createddate
																										).format(
																											'MM/DD/YYYY, HH:mm'
																										)}
																									</td>
																									<td className="reportsTable">
																										{moment(
																											civ.modifieddate
																										).format(
																											'MM/DD/YYYY, HH:mm'
																										)}
																									</td>
																									<td className="reportsTable" />
																								</tr>
																							)
																					  )
																					: ''}
																			</table>
																		</div>
																	</td>
																</tr>
															</table>
														</div>
													</Typography>
												</div>
											</Accordion>
										))}
									</div>
								</>
							)}
						</div>
						{/* claim comments */}
						<Dialog
							open={this.state.commentdialoguebox}
							onClose={this.handleClose}
							PaperComponent={PaperComponent}
							aria-labelledby="draggable-dialog-title"
							fullWidth
							maxWidth="md"
						>
							<DialogTitle
								style={{ cursor: 'move', color: 'white', backgroundColor: '#0a3161' }}
								id="draggable-dialog-title"
							>
								{showListcommentdiv ? 'Comments' : ''}
								{/* {showAddcommentdiv ? 'Add comments' : ''} */}
							</DialogTitle>
							<DialogContent>
								{showAddcommentdiv ? (
									<div>
										<div className="flex mb-10 vertical pt-10">
											<TextareaAutosize
												className={clsx(
													classes.textarea,
													`p-4 flex flex-col input-placeholder`
												)}
												id="claimNotes"
												placeholder=" Add Comment *"
												name="commentval"
												// autoFocus
												value={commentval}
												required
												rowsMin={10}
												// ref={commentRef}
												type="text"
												fullWidth
												style={{ padding: '12px', border: '1px solid #0a3161' }}
												data-gramm="false"
												onChange={e => this.handleCommentDescChange(e)}
												// disabled={isLocked || ViewData}
											/>
										</div>
										<div className="flex flex-row justify-center">
											<Button
												style={{ marginRight: '20px' }}
												variant="contained"
												color="primary"
												className={`w-180 mb-10 flex btn-shadow btn-outline-primary justify-center `}
												aria-label="Register"
												type="button"
												onClick={this.handlesavecomments}
												// disabled={noteSubmitBtn || isLocked}
											>
												Save
											</Button>
											{/* <Button
												variant="contained"
												color="primary"
												style={{
													marginRight: '20px',
													backgroundColor: 'white',
													outline: '1px solid #E5E5E5',
													color: 'black',
													borderRadius: '0px'
												}}
												className="w-180 mb-16 flex btn-shadow btn-outline-primary justify-center"
												aria-label="Register"
												type="button"
												onClick={this.handleaddcommentCancel}
											>
												Back to All Comments
											</Button> */}
										</div>
									</div>
								) : (
									''
								)}
								{showListcommentdiv ? (
									<div
										style={{
											border: '1px solid grey',
											padding: '10px',
											paddingRight: '2px',
											overflowY: 'scroll',
											maxHeight: '350px'
										}}
									>
										<table width="100%" id="comment-id">
											<tr>
												<th className="reportheading1 searchheading">User</th>
												<th className="reportheading1 searchheading">Date</th>
												<th className="reportheading1 searchheading">Comments</th>
												<th className="reportheading1 searchheading">Type</th>
											</tr>
											{/* {workbenchFilterData.map((ins1, index11) => ( */}
											<>
												{commentsState.length > 0 ? (
													commentsState.map((cc1, index121) => (
														<tr>
															<td className="reportheading">
																<p>
																	{/* {' '}
																	{cc1.firstname !== null && cc1.lastname !== null
																		? `${cc1.firstname} 
																								  ${cc1.lastname}`
																		: `${cc1.companyname}`} */}

																	{cc1.user}
																</p>
															</td>
															<td className="reportheading">
																{moment(cc1.createddate).format('MM/DD/YYYY, HH:mm')}
															</td>
															<td className="reportheading" title={cc1.comment}>
																{cc1.comment.length > 30
																	? `${cc1.comment.substring(0, 30)}...`
																	: `${cc1.comment.substring(0, 30)}`}
															</td>
															<td className="reportheading"> {cc1.type}</td>
														</tr>
													))
												) : (
													<tr>
														<td colSpan="4">
															<p style={{ textAlign: 'center' }}>No comments to show</p>
														</td>
													</tr>
												)}
											</>
										</table>
									</div>
								) : (
									''
								)}
							</DialogContent>
							<DialogActions className="note-button-center">
								{/* <Button
									style={{ height: '36px', width: '200px' }}
									variant="contained"
									color="primary"
									className="w-150 mb-16 flex btn-shadow btn-outline-primary justify-center"
									aria-label="Register"
									type="button"
									value="CreateClient"
									onClick={this.showaddcommentdialog}
								>
									Add Comments
								</Button> */}
								<Button
									style={{ height: '36px', width: '200px' }}
									onClick={this.handlecommentdialogclose}
									className="w-150 mb-16 flex btn-shadow btn-outline-primary justify-center"
								>
									Close
								</Button>
							</DialogActions>
						</Dialog>
						{/* claim notes */}
						<Dialog
							open={this.state.notesdialoguebox}
							onClose={this.handleClose}
							PaperComponent={PaperComponent}
							aria-labelledby="draggable-dialog-title"
							fullWidth
							maxWidth="md"
						>
							<DialogTitle
								style={{ cursor: 'move', color: 'white', backgroundColor: '#0a3161' }}
								id="draggable-dialog-title"
							>
								{showListnotediv ? 'Notes' : ''}
								{/* {showAddnotediv ? 'Add Note' : ''} */}
							</DialogTitle>
							<DialogContent>
								{showAddnotediv ? (
									<div>
										<div className="flex mb-10 vertical pt-10">
											<TextareaAutosize
												id="claimNotes"
												placeholder="Add Note *"
												name="commentval"
												// autoFocus
												value={commentval}
												rowsMin={10}
												// ref={commentRef}
												type="text"
												fullWidth
												style={{ padding: '12px', border: '1px solid #0a3161' }}
												data-gramm="false"
												onChange={e => this.handleCommentDescChange(e)}
												// disabled={isLocked || ViewData}
												className={clsx(
													classes.textarea,
													`mb-10 p-4 flex flex-col input-placeholder`
												)}
											/>
										</div>
										<div className="flex flex-row justify-center mb-10">
											<Button
												style={{ marginRight: '20px' }}
												variant="contained"
												color="primary"
												className={`w-180 mb -10 flex btn-shadow btn-outline-primary justify-center `}
												aria-label="Register"
												type="submit"
												onClick={this.handlesavenotes}
												// disabled={noteSubmitBtn || isLocked}
											>
												Save
											</Button>
											{/* <Button
												variant="contained"
												color="primary"
												style={{
													marginRight: '20px',
													backgroundColor: 'white',
													outline: '1px solid #E5E5E5',
													color: 'black',
													borderRadius: '0px'
												}}
												className="w-180 mb-16 flex btn-shadow btn-outline-primary justify-center"
												aria-label="Register"
												type="button"
												onClick={this.handleaddnoteCancel}
											>
												Back to All Notes
											</Button> */}
										</div>
									</div>
								) : (
									''
								)}
								{showListnotediv ? (
									<div
										style={{
											border: '1px solid grey',
											padding: '10px',
											paddingRight: '2px',
											overflowY: 'scroll',
											maxHeight: '350px'
										}}
									>
										<table width="100%" id="comment-id">
											<tr>
												<th className="reportheading1 searchheading">User</th>
												<th className="reportheading1 searchheading">Date</th>
												<th className="reportheading1 searchheading">Comments</th>
												<th className="reportheading1 searchheading">Type</th>
											</tr>
											{notesState.length > 0 ? (
												notesState.map((cc1, index121) => (
													<tr>
														<td className="reportheading">
															<p>
																{/* {' '}
																	{cc1.firstname !== null && cc1.lastname !== null
																		? `${cc1.firstname} 
																								  ${cc1.lastname}`
																		: `${cc1.companyname}`} */}

																{cc1.user}
															</p>
														</td>
														<td className="reportheading">
															{moment(cc1.createddate).format('MM/DD/YYYY, HH:mm')}
														</td>
														<td className="reportheading" title={cc1.comment}>
															{cc1.comment.length > 30
																? `${cc1.comment.substring(0, 30)}...`
																: `${cc1.comment.substring(0, 30)}`}
														</td>
														<td className="reportheading"> {cc1.type}</td>
													</tr>
												))
											) : (
												<tr>
													<td colSpan="4">
														<p style={{ textAlign: 'center' }}>No Notes to show</p>
													</td>
												</tr>
											)}
										</table>
									</div>
								) : (
									''
								)}
							</DialogContent>
							<DialogActions className="note-button-center">
								{/* <Button
									style={{ height: '36px', width: '200px' }}
									variant="contained"
									color="primary"
									className="w-150 mb-16 flex btn-shadow btn-outline-primary justify-center"
									aria-label="Register"
									type="button"
									value="CreateClient"
									onClick={this.showaddnotedialog}
								>
									Add Notes
								</Button> */}
								<Button
									style={{ height: '36px', width: '200px' }}
									onClick={this.handlenotesdialogclose}
									className="w-150 mb-16 flex btn-shadow btn-outline-primary justify-center"
								>
									Close
								</Button>
							</DialogActions>
						</Dialog>
						<Dialog
							fullWidth
							maxWidth="sm"
							anchorReference="anchorPosition"
							anchorPosition={{ top: 400, left: 900 }}
							anchorOrigin={{
								vertical: 'bottom',
								horizontal: 'right'
							}}
							transformOrigin={{
								vertical: 'center',
								horizontal: 'center'
							}}
							open={showacceptdialog}
						>
							<div
								style={{
									minHeight: '150px',
									maxHeight: '1650px',
									overflowY: 'auto'
								}}
							>
								<div
									className="flex"
									style={{
										background: '#3C4B64',
										paddingTop: '5px',
										paddingBottom: '5px',
										color: 'white'
									}}
								>
									<div style={{ flexBasis: '90%', textAlign: 'center' }}>
										<h2>Review Document</h2>
									</div>

									<div style={{ flexBasis: '10%' }}>
										<button
											type="button"
											style={{
												top: 10,
												position: 'absolute',
												right: 10
											}}
											onClick={this.closeacceptdialog}
										>
											<div>
												<i
													className="material-icons"
													title="close"
													style={{ fontSize: '20px' }}
												>
													close
												</i>
											</div>
										</button>
									</div>
								</div>
								<div>
									<div
										className="mt-16 mb-16 confirmationAlertBody"
										style={{
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											fontSize: '18px'
										}}
									>
										Are you sure do you want to accept the selected document ?
									</div>

									<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
										<Button
											variant="contained"
											color="primary"
											className="w-160 mb-16 mr-16 flex btn-shadow btn-outline-primary justify-center"
											aria-label="Register"
											type="button"
											onClick={this.updateacceptclaimreports}
										>
											Accept
										</Button>

										<Button
											variant="contained"
											color="primary"
											className="w-160 mb-16 flex btn-shadow btn-outline-primary justify-center"
											aria-label="Register"
											type="button"
											onClick={this.closeacceptdialog}
										>
											Cancel
										</Button>
									</div>
								</div>
							</div>
						</Dialog>
						<Dialog
							fullWidth
							maxWidth="sm"
							anchorReference="anchorPosition"
							anchorPosition={{ top: 400, left: 900 }}
							anchorOrigin={{
								vertical: 'bottom',
								horizontal: 'right'
							}}
							transformOrigin={{
								vertical: 'center',
								horizontal: 'center'
							}}
							open={showrejectdialog}
						>
							<div
								style={{
									minHeight: '150px',
									maxHeight: '1650px',
									overflowY: 'auto'
								}}
							>
								<div
									className="flex"
									style={{
										background: '#3C4B64',
										paddingTop: '5px',
										paddingBottom: '5px',
										color: 'white'
									}}
								>
									<div style={{ flexBasis: '90%', textAlign: 'center' }}>
										<h2>Review Document</h2>
									</div>

									<div style={{ flexBasis: '10%' }}>
										<button
											type="button"
											style={{
												top: 10,
												position: 'absolute',
												right: 10
											}}
											onClick={this.closerejectdialog}
										>
											<div>
												<i
													className="material-icons"
													title="close"
													style={{ fontSize: '20px' }}
												>
													close
												</i>
											</div>
										</button>
									</div>
								</div>
								<div>
									<div
										className="mt-16 mb-16 confirmationAlertBody"
										style={{
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											fontSize: '18px'
										}}
									>
										Are you sure do you want to reject the selected document ?
									</div>
									<div
										style={{
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center'
										}}
									>
										<TextField
											className="mb-16 flex flex-col input-placeholder w-4/5"
											label="Reject Reason *"
											name="rejectReason"
											value={rejectReason}
											size="small"
											type="text"
											onChange={e => {
												this.setRejectReason(e);
											}}
											variant="outlined"
											fullWidth
										/>
									</div>
									<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
										<Button
											variant="contained"
											color="primary"
											className="w-160 mb-16 mr-16 flex btn-shadow btn-outline-primary justify-center"
											aria-label="Register"
											type="button"
											onClick={this.updaterejectclaimreports}
										>
											Reject
										</Button>
										<Button
											variant="contained"
											color="primary"
											className="w-160 mb-16 flex btn-shadow btn-outline-primary justify-center"
											aria-label="Register"
											type="button"
											onClick={this.closerejectdialog}
										>
											Cancel
										</Button>
									</div>
								</div>
							</div>
						</Dialog>
						<Dialog
							fullWidth
							maxWidth="sm"
							anchorReference="anchorPosition"
							anchorPosition={{ top: 400, left: 900 }}
							anchorOrigin={{
								vertical: 'bottom',
								horizontal: 'right'
							}}
							transformOrigin={{
								vertical: 'center',
								horizontal: 'center'
							}}
							open={showholddialog}
						>
							<div
								style={{
									minHeight: '150px',
									maxHeight: '1650px',
									overflowY: 'auto'
								}}
							>
								<div
									className="flex"
									style={{
										background: '#3C4B64',
										paddingTop: '5px',
										paddingBottom: '5px',
										color: 'white'
									}}
								>
									<div style={{ flexBasis: '90%', textAlign: 'center' }}>
										<h2>Review Document</h2>
									</div>

									<div style={{ flexBasis: '10%' }}>
										<button
											type="button"
											style={{
												top: 10,
												position: 'absolute',
												right: 10
											}}
											onClick={this.closeholddialog}
										>
											<div>
												<i
													className="material-icons"
													title="close"
													style={{ fontSize: '20px' }}
												>
													close
												</i>
											</div>
										</button>
									</div>
								</div>
								<div>
									<div
										className="mt-16 mb-16 confirmationAlertBody"
										style={{
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											fontSize: '18px'
										}}
									>
										Are you sure do you want to Hold the selected document ?
									</div>

									<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
										<Button
											variant="contained"
											color="primary"
											className="w-160 mb-16 mr-16 flex btn-shadow btn-outline-primary justify-center"
											aria-label="Register"
											type="button"
											onClick={this.updateholdclaimreports}
										>
											Hold
										</Button>

										<Button
											variant="contained"
											color="primary"
											className="w-160 mb-16 flex btn-shadow btn-outline-primary justify-center"
											aria-label="Register"
											type="button"
											onClick={this.closeholddialog}
										>
											Cancel
										</Button>
									</div>
								</div>
							</div>
						</Dialog>
						<Grid
							container
							className="gridcss"
							spacing={{ xs: 2, md: 2 }}
							columns={{ xs: 4, sm: 8, md: 12 }}
						>
							<div>
								<Paper elevation={3} style={{ margin: '10px' }}>
									<Card>
										<CardContent
											className={`empty-claim-css ${emptyclaims ? 'hideemptyclaim' : ''}`}
										>
											No claims found.
										</CardContent>
									</Card>
								</Paper>
							</div>
						</Grid>
						{/* <Pagination count={10} variant="outlined" shape="rounded" /> */}
					</div>
				</div>
			</div>
		);
	}
}
const mapStateToProps = state => ({
	systemfields: state.CommonReducer.systemfields,
	userid: state.auth.user.data.userid,
	clientid: state.auth.user.data.clientid,
	permissiondata: state.auth,
	roles: state.auth.user.data.roles,
	clients: state.CommonReducer.clients,
	clientroles: state.CommonReducer.roles
});
export default withRouter(withStyles(styles)(connect(mapStateToProps, {})(Workbench)));
