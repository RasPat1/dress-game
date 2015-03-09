var mui = require('material-ui'),
	React = require('react'),
	injectTapEventPlugin = require('react-tap-event-plugin'),
	RaisedButton = mui.RaisedButton,
	FlatButton = mui.FlatButton,
	Paper = mui.Paper,
	url = "https://shoptiques.com/api/dressGame/interaction";

injectTapEventPlugin();

var FeatureTitle = React.createClass({
	render: function() {
		return typeof this.props.name !== "undefined" ?
			 (<h1 className="feature__name">{this.props.name}</h1>) :
			 (<h1 className="feature__name feature__name--empty">No Feaure Yet</h1>);
	}
});

var Product = React.createClass({
  render: function() {
  	if (this.props.id) {
	    return (
	      <div className="product__holder">
	        <h2 className="product__name">{this.props.name}</h2>
	        <ProductImageSet className="product__image-set" imageUrls={this.props.imageUrls} />
	        <div className="product__price">{this.props.price}</div>
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
		this.props.sendInteraction(this.props.productId, featureArray);
	},
	handleClickNeither: function() {
		var featureArray = [];
		for (var index in this.props.features) {
			featureArray.push({featureId: this.props.features[index].id, decision: "false"});
		}
		this.props.sendInteraction(this.props.productId, featureArray);
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
			this.props.sendInteraction(this.props.productId, featureArray);
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
	getInitialState: function() {
		this.getNextData();
		return {product: null, feature: null, selection: null};
	},
	getNextData: function(fails) {
		fails = typeof fails == 'undefined' ? 0 : fails
		if (fails > 5) {
			return;
		}
		$.ajax({
			url: this.props.url,
			dataType: "json",
			xhrFields: {
				withCredentials: true
			},
			success: function(data) {
					this.setPropObjects(data);
			}.bind(this),
			error: function(xhr, status, error) {
				console.error(this.props.url, status, error);
				fails++;
				this.getNextData(fails);
			}.bind(this)
		});
	},
	sendInteraction: function(productId, featureDecisions) {
		for (var index in featureDecisions) {
			var featureDecision = featureDecisions[index];
			var data = {
				productId: productId,
				productFeatureId: featureDecision.featureId,
				decision: featureDecision.decision,
			};

			$.ajax({
				type: "POST",
				url: this.props.url,
				dataType: "json",
				data: data,
				xhrFields: {
					withCredentials: true
				},
				success: function(data) {
				
				}.bind(this),
				error: function(xhr, status, error) {
					console.error(this.props.url, status, err.toString());
				}.bind(this)
			});
		}
		this.getNextData();
	},
	setPropObjects: function(data) {
		// extract the properties we want.
		// Since we're using props we want explicit control of which values 
		// go onto the elements to make sure there are no namespacing conflicts.
		var productProps = {}
		if (data.product) {
			productProps.name = data.product.name;
			productProps.price = data.product.price;
			productProps.description = data.product.description;
			productProps.id = data.product.id;
			productProps.imageUrls = data.imageUrls;
		}

		var selectionProps = {};
		if (data.product && data.features) {
			selectionProps.productId = data.product.id;
			selectionProps.features = data.features;
		}

		this.setState({product: productProps, selection:selectionProps});
	},
	render: function() {
		return (
			<Paper zDepth={2} className="app" innerClassName="app__holder">
				<Product {...this.state.product} className="product" />
				<Selection {...this.state.selection} sendInteraction={this.sendInteraction} className="selection" />
			</Paper>
			);
	}
});

React.render(
  <DressApp url={url} />, 
  document.getElementById('content')
);