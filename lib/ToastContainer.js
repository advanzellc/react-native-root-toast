import React, { Component } from "react"
import PropTypes from "prop-types"
import { ViewPropTypes } from "deprecated-react-native-prop-types"

import {
    StyleSheet,
    View,
    Animated,
    Dimensions,
    TouchableWithoutFeedback,
    Easing,
    Keyboard,
} from "react-native"

const TOAST_MAX_WIDTH = 0.85
const TOAST_ANIMATION_DURATION = 200

const styles = StyleSheet.create({
    defaultStyle: {
        width: "100%",
        position: "absolute",
        left: 0,
        right: 0,
        justifyContent: "center",
        alignItems: "center",
    },
    containerStyle: {
        padding: 10,
        backgroundColor: "#000",
        opacity: 1,
        borderRadius: 5,
    },
})

class ToastContainer extends Component {
    static displayName = "ToastContainer"

    static propTypes = {
        containerStyle: ViewPropTypes.style,
        duration: PropTypes.number,
        visible: PropTypes.bool,
        position: PropTypes.number,
        animation: PropTypes.bool,
        keyboardAvoiding: PropTypes.bool,
        opacity: PropTypes.number,
        delay: PropTypes.number,
        hideOnPress: PropTypes.bool,
        onPress: PropTypes.func,
        onHide: PropTypes.func,
        onHidden: PropTypes.func,
        onShow: PropTypes.func,
        onShown: PropTypes.func,
    }

    static defaultProps = {
        visible: false,
        duration: 2000,
        animation: true,
        position: 40,
        opacity: 1,
        delay: 0,
        hideOnPress: true,
        keyboardAvoiding: true,
    }

    constructor() {
        super(...arguments)
        const window = Dimensions.get("window")
        this.state = {
            visible: this.props.visible,
            opacity: new Animated.Value(0),
            windowWidth: window.width,
            windowHeight: window.height,
            keyboardScreenY: window.height,
        }
    }

    componentDidMount = () => {
        this.dimensionListener = Dimensions.addEventListener(
            "change",
            this._windowChanged
        )
        if (this.props.keyboardAvoiding) {
            this.keyboardListener = Keyboard.addListener(
                "keyboardDidChangeFrame",
                this._keyboardDidChangeFrame
            )
        }
        if (this.state.visible) {
            this._showTimeout = setTimeout(
                () => this._show(),
                this.props.delay
            )
        }
    }

    componentDidUpdate = prevProps => {
        if (this.props.visible !== prevProps.visible) {
            if (this.props.visible) {
                clearTimeout(this._showTimeout)
                clearTimeout(this._hideTimeout)
                this._showTimeout = setTimeout(
                    () => this._show(),
                    this.props.delay
                )
            } else {
                this._hide()
            }

            this.setState({
                visible: this.props.visible,
            })
        }
    }

    componentWillUnmount = () => {
        this._hide()
        this.dimensionListener?.remove()
        this.keyboardListener?.remove()
    }

    _animating = false
    _root = null
    _hideTimeout = null
    _showTimeout = null
    _keyboardHeight = 0

    _windowChanged = ({ window }) => {
        this.setState({
            windowWidth: window.width,
            windowHeight: window.height,
        })
    }

    _keyboardDidChangeFrame = ({ endCoordinates }) => {
        this.setState({
            keyboardScreenY: endCoordinates.screenY,
        })
    }

    _show = () => {
        clearTimeout(this._showTimeout)
        if (!this._animating) {
            clearTimeout(this._hideTimeout)
            this._animating = true
            this._root.setNativeProps({
                pointerEvents: "auto",
            })
            this.props.onShow && this.props.onShow(this.props.siblingManager)
            Animated.timing(this.state.opacity, {
                toValue: this.props.opacity,
                duration: this.props.animation ? TOAST_ANIMATION_DURATION : 0,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }).start(({ finished }) => {
                if (finished) {
                    this._animating = !finished
                    this.props.onShown &&
                        this.props.onShown(this.props.siblingManager)
                    if (this.props.duration > 0) {
                        this._hideTimeout = setTimeout(
                            () => this._hide(),
                            this.props.duration
                        )
                    }
                }
            })
        }
    }

    _hide = () => {
        clearTimeout(this._showTimeout)
        clearTimeout(this._hideTimeout)
        if (!this._animating) {
            if (this._root) {
                this._root.setNativeProps({
                    pointerEvents: "none",
                })
            }

            if (this.props.onHide) {
                this.props.onHide(this.props.siblingManager)
            }

            Animated.timing(this.state.opacity, {
                toValue: 0,
                duration: this.props.animation ? TOAST_ANIMATION_DURATION : 0,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
            }).start(({ finished }) => {
                if (finished) {
                    this._animating = false
                    this.props.onHidden &&
                        this.props.onHidden(this.props.siblingManager)
                }
            })
        }
    }

    render() {
        const { visible, windowWidth, windowHeight, keyboardScreenY } =
            this.state
        const {
            position: offset,
            onPress,
            hideOnPress,
            containerStyle,
            children,
        } = this.props

        if (!visible && !this._animating) {
            return null
        }

        const keyboardHeight = Math.max(windowHeight - keyboardScreenY, 0)
        const position = offset
            ? {
                  [offset < 0 ? "bottom" : "top"]:
                      offset < 0 ? keyboardHeight - offset : offset,
              }
            : {
                  top: 0,
                  bottom: keyboardHeight,
              }

        const onPressHandler = () => {
            typeof onPress === "function" ? onPress() : null
            hideOnPress ? this._hide() : null
        }

        return (
          <View
                style={[
                    styles.defaultStyle,
                    {
                        paddingHorizontal:
                            windowWidth * ((1 - TOAST_MAX_WIDTH) / 2),
                    },
                    position,
                ]}
                pointerEvents="box-none"
            >
            <TouchableWithoutFeedback onPress={onPressHandler}>
              <Animated.View
                        style={[
                            styles.containerStyle,
                            containerStyle,
                            { opacity: this.state.opacity },
                        ]}
                        pointerEvents="none"
                        ref={ele => (this._root = ele)}
                    >
                {children}
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        )
    }
}

export default ToastContainer
