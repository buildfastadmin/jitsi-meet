// @flow

import React, { Component } from 'react';

declare var interfaceConfig: Object;

/**
 * The type of the React {@code Component} props of {@link OverlayFrame}.
 */
type Props = {

    /**
     * The children components to be displayed into the overlay frame.
     */
    children: React$Node,

    /**
     * Indicates the css style of the overlay. If true, then lighter; darker,
     * otherwise.
     */
    isLightOverlay?: boolean,

    /**
     * The style property.
     */
    style: Object,

    /**
     * Additional classes to be added to the overlay
     */
    className?: string,
};

/**
 * Implements a React {@link Component} for the frame of the overlays.
 */
export default class OverlayFrame extends Component<Props> {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement|null}
     */
    render() {
        return (
            <div
                className = { `${this.props.isLightOverlay ? 'overlay__container-light' : 'overlay__container'} ${this.props.className}` }
                id = 'overlay'
                style = { this.props.style }>
                <div className = { 'overlay__content' }>
                    {
                        this.props.children
                    }
                </div>
            </div>
        );
    }
}
