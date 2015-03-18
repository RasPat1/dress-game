var mui = require('material-ui'),
	React = require('react'),
	injectTapEventPlugin = require('react-tap-event-plugin'),
	RaisedButton = mui.RaisedButton,
	FlatButton = mui.FlatButton,
	Paper = mui.Paper,
	TextField = mui.TextField,
	Dialog = mui.Dialog,
	url = "https://www.shoptiques.com/api/dressGame/interaction",
	loginUrl = "https://www.shoptiques.com/api/v1/login";

injectTapEventPlugin();

var LoadingOverlay = React.createClass({
	componentWillUpdate: function() {
		if (this.props.loading) {
			this.refs.loading.show();
		} else {
			this.refs.loading.dismiss();
		}
	},
	render: function() {
		return (
			<Dialog ref="loading" title="Loading" className={"loading__parent loading__parent--" + this.props.loading} contentClassName="loading__content">
				<div className="loading__loader">
				    <svg className="circular">
				        <circle className="path" cx="50" cy="50" r="20" fill="none" stroke-width="4" stroke-miterlimit="10"/>
				    </svg>
				</div>
			</Dialog>
			)
	}
})

var LoginModal = React.createClass({
	componentDidMount: function() {
		this.refs.email.focus();
	},
	handleSubmit: function(e) {
		e.preventDefault();
		var email = this.refs.email.getValue();
		var password = this.refs.password.getValue();
		if (!email || !password) {
			return;
		}
		this.props.handleLogin(email, password);
		this.refs.email.getDOMNode().value = "";
		this.refs.password.getDOMNode().value = "";
	},
	getClassName: function() {
		var className = "login-modal";
		if (this.props.loggedIn) {
			className += " login-modal--logged-in";
		}
		return className;
	},
	render: function() {
		return (
		<Paper zDepth={4} className={this.getClassName()}
		 innerClassName="login-modal__holder">
			<h3 className="login-modal__title">LOG IN!</h3>
			<form className="login-modal__form" onSubmit={this.handleSubmit}>
				<TextField className="login-modal__email"
				 hintText="Email" ref="email" type="email" />
  				<TextField className="login-modal__password"
  				 hintText="Password" ref="password" type="password" />
				<RaisedButton className="login-modal__submit" 
				 label="Log In" secondary={true} />
			</form>
		</Paper>
		);
	}
});

var Product = React.createClass({
  render: function() {
	if (this.props.id) {
		return (
		  <div className="product__holder">
			<h2 className="product__name">{this.props.name}</h2>
			<div className="product__price">{this.props.price}</div>
			<ProductImageSet className="product__image-set" imageUrls={this.props.imageUrls} />
			<div className="product__description" dangerolySetInnerHTML={{__html: this.props.description}}></div>
		  </div>
		  );
	} else {
		return (<h2 className="product__name">No Product</h2>);
	}
  }
});

var ProductImageSet = React.createClass({
	render: function() {
		if (this.props.imageUrls) {
			return (
					<div className="product__photo-holder">
						<img className="product__photo" src={this.props.imageUrls.primary} />
						<img className="product__photo" src={this.props.imageUrls.secondary} />
					</div>
				);
		}
	}
});

var Selection = React.createClass({
	handleClickBoth: function() {
		var featureArray = [];
		for (var index in this.props.features) {
			featureArray.push({featureId: this.props.features[index].id, decision: "true"});
		}
		this.props.updateProduct(this.props.productId, featureArray);
	},
	handleClickNeither: function() {
		var featureArray = [];
		for (var index in this.props.features) {
			featureArray.push({featureId: this.props.features[index].id, decision: "false"});
		}
		this.props.updateProduct(this.props.productId, featureArray);
	},
	handleFeatureClick: function(featureId) {
		return function() {
			var featureArray = [];
			for (var index in this.props.features) {
				var decision = "false";
				var buttonPropId = this.props.features[index].id;
				if (featureId === buttonPropId) {
					decision = "true";
				}
				featureArray.push({featureId: buttonPropId, decision: decision});
			}
			this.props.updateProduct(this.props.productId, featureArray);
		}
	},
	render: function() {
		var features = [];
		if (this.props.features) {
			features = this.props.features.map(function(feature) {
				var className =  "selection__feature-btn selection__feature-btn--primary";
				return (<RaisedButton label={ feature.name } onClick={this.handleFeatureClick(feature.id).bind(this)} key={feature.name} primary={true} className={className} />);
			}, this);
		}

		return (
			<div className="selection">
				<div className="selection__feature-btn-holder selection__feature-btn-holder--top">
					{ features }
				</div>
				<div className="selection__feature-btn-holder selection__feature-btn-holder--bottom">
					<FlatButton label="Both" onClick={this.handleClickBoth} key="both" secondary={true} className="selection__feature-btn selection__feature-btn--secondary"/>
					<FlatButton label="Neither" onClick={this.handleClickNeither} key="neither" primary={true} className="selection__feature-btn selection__feature-btn--secondary"/>
				</div>
			</div>
		);
	}
});



var DressApp = React.createClass({
   /******************************************************************************
	LifeCycle
	******************************************************************************/
	getInitialState: function() {
		return {
			interactionQueue: [],
			product: null,
			selection: null,
			authToken: null,
			loading: true,
			requesting: false
		};
	},
	componentDidMount: function() {
		this.checkLogin();
	},
   /******************************************************************************
	Application Logic
	******************************************************************************/
	getInitialData: function() {
		this.requestData(function(data) {
			if (data) {
				this.enqueueData(data);
				this.dequeueData();
				this.setState({loading: false});
			}
		}.bind(this));
	},
	getNextData: function() {
		this.requestData(function(data) {
			this.enqueueData(data);
		}.bind(this));
	},
	enqueueData: function(data) {
		var interactionQueue = this.state.interactionQueue;
		for (var i = 0; i < data.interactions.length; i++) {
			interactionQueue.unshift(data.interactions[i]);
		}
		this.setState({'interactionQueue': interactionQueue});
	},
	dequeueData: function() {
		// Grab the front of the queue and save the modified queue
		var interactionQueue = this.state.interactionQueue;
		var interaction = interactionQueue.shift();
		this.setState({'interactionQueue': interactionQueue});

		// update the state with the newly dequeued product
		this.setPropObjects(interaction);

		// If the queue is running low grab more data
		if (this.state.interactionQueue.length < 15 && !this.state.requesting) {
			this.getNextData();
		}
	},
	updateProduct: function(id, featureArray) {
		this.dequeueData()
		this.sendInteraction(id, featureArray)
	},

   /******************************************************************************
	Log in Logic
	******************************************************************************/
	handleLogin: function(email, password) {
		var data = {username: email, password: password};
		$.ajax({
			type: "POST",
			url: this.props.loginUrl,
			data: data,
			success: function(data) {
				this.setState({authToken: data.access_token}, this.getInitialData);
				localStorage.setItem('dress-auth-token', data.access_token);
				localStorage.setItem('dress-auth-date', new Date().getTime());
			}.bind(this),
			error: function(xhr, status, error) {
				this.setState({authToken: null});
				console.error(this.props.loginUrl, status, error.toString());
				alert("Yikes! Login Failed");
			}.bind(this)
		});
	},
	checkLogin: function() {
		var authToken = localStorage.getItem('dress-auth-token');
		var date = localStorage.getItem('dress-auth-date');
		if (authToken) {
			this.setState({authToken: authToken}, this.getInitialData);
		}
	},

   /*******************************************************************************
	Requests
	*******************************************************************************/
	requestData: function(callback, fails) {
		fails = typeof fails == 'undefined' ? 0 : fails
		if (fails > 2) {
			return;
		}
		this.setState({requesting: true});
		$.ajax({
			url: this.props.url,
			data: {count: 30},
			dataType: "json",
			beforeSend: function (request) {
				request.setRequestHeader("X-Auth-Token", this.state.authToken);
			}.bind(this),
			success: function(data) {
				callback(data)
				this.setState({requesting:false})
			}.bind(this),
			statusCode: {
				401: function() {
					localStorage.removeItem('dress-auth-token');
					localStorage.removeItem('dress-auth-date');
					this.setState({authToken: null});
				}.bind(this)
			},
			error: function(xhr, status, error) {
				localStorage.removeItem('dress-auth-token');
				localStorage.removeItem('dress-auth-date');
				console.error(this.props.url, status, error);
				fails++;
				this.requestData(callback, fails);
			}.bind(this)
		});
	},
	sendInteraction: function(productId, featureDecisions) {
		for (var index in featureDecisions) {
			var data = this.formatRequestData(productId, featureDecisions[index]);

			$.ajax({
				type: "POST",
				url: this.props.url,
				dataType: "json",
				data: data,
				beforeSend: function (request) {
	                request.setRequestHeader("X-Auth-Token", this.state.authToken);
	            }.bind(this),
	            success: function(data) {

				}.bind(this),
				error: function(xhr, status, error) {
					console.error(this.props.url, status, error.toString());
				}.bind(this)
			});
		}
	},

   /******************************************************************************
	Formatting data
	******************************************************************************/
	formatRequestData: function(productId, featureDecision) {
		var data = {
			productId: productId,
			productFeatureId: featureDecision.featureId,
			decision: featureDecision.decision,
		};
		return data;
	},
	setPropObjects: function(data) {
		// extract the properties we want.
		// Since we're using props we want explicit control of which values 
		// go onto the elements to make sure there are no namespacing conflicts.
		var productProps = {imageUrls: {}}
		var emptySrc = '';
		if (data && data.product) {
			productProps.name = data.product.name;
			productProps.price = data.product.filterPriceUS;
			productProps.description = data.product.description;
			productProps.id = data.product.id;
			productProps.imageUrls.primary = data.imageUrls.primary ? data.imageUrls.primary : emptySrc;
			productProps.imageUrls.secondary = data.imageUrls.secondary ? data.imageUrls.secondary : emptySrc;
		}

		var selectionProps = {};
		if (data && data.product && data.features) {
			selectionProps.productId = data.product.id;
			selectionProps.features = data.features;
		}

		this.setState({product: productProps, selection:selectionProps});
	},
	render: function() {
		return (
			<Paper zDepth={2} className="app" innerClassName="app__holder">
				<LoadingOverlay loading={this.state.loading} />
				<LoginModal loggedIn={this.state.authToken ? true : false} handleLogin={this.handleLogin} />
				<Product {...this.state.product} className="product" />
				<Selection {...this.state.selection} updateProduct={this.updateProduct} className="selection" />
			</Paper>
			);
	}
});

React.render(
  <DressApp url={url} loginUrl={loginUrl} />, 
  document.getElementById('content')
);