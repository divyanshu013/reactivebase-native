// @flow

import React, { Component, type Node } from "react";
import { connect } from "react-redux";
import { View } from "react-native";

import { addComponent, removeComponent, updateQuery } from "../actions";

type Props = {
	componentId: string,
	addComponent: (componentId: string) => void,
	removeComponent: (componentId: string) => void,
	updateQuery: (componentId: string, query: {}, onQueryChange?: (prev: {}, next: {}) => any) => void,
	beforeValueChange?: (defaultSelected: string | null) => Promise<any>,
	customQuery?: (defaultSelected: string | null) => {},
	children?: Node,
	defaultSelected?: string | null,
	onValueChange?: (defaultSelected: string | null) => void
};

class DataController extends Component<void, Props, void> {
	componentDidMount() {
		this.props.addComponent(this.props.componentId);

		if (this.props.defaultSelected) {
			this.updateQuery(this.props.defaultSelected);
		} else {
			this.updateQuery();
		}
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.defaultSelected !== nextProps.defaultSelected) {
			this.updateQuery(nextProps.defaultSelected);
		}
	}

	componentWillUnmount() {
		this.props.removeComponent(this.props.componentId);
	}

	defaultQuery() {
		return {
			"match_all": {}
		}
	}

	updateQuery = (defaultSelected = null) => {
		const query = this.props.customQuery ? this.props.customQuery : this.defaultQuery;
		const callback = this.props.onQueryChange || null;
		const performUpdate = () => {
			if (this.props.onValueChange) {
				this.props.onValueChange(defaultSelected);
			}
			this.props.updateQuery(this.props.componentId, query(defaultSelected), callback);
		}

		if (this.props.beforeValueChange) {
			this.props.beforeValueChange(defaultSelected)
				.then(() => {
					performUpdate();
				})
				.catch((e) => {
					console.warn(`${this.props.componentId} - beforeValueChange rejected the promise with `, e);
				});
		} else {
			performUpdate();
		}
	}

	render() {
		return (
			<View>
				{this.props.children}
			</View>
		);
	}
}

const mapDispatchtoProps = dispatch => ({
	addComponent: component => dispatch(addComponent(component)),
	removeComponent: component => dispatch(removeComponent(component)),
	updateQuery: (component, query, onQueryChange) => dispatch(updateQuery(component, query, onQueryChange))
});

export default connect(null, mapDispatchtoProps)(DataController);
