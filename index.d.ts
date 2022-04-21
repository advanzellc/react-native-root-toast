/**
 * typescript definition
 * @author wallel
 */
declare module "react-native-root-toast"{
    import * as React from 'react';
    import * as ReactNative from "react-native";
    import {TextStyle,StyleProp,ViewStyle} from "react-native";
    export interface ToastOptions {
        containerStyle?: StyleProp<ViewStyle>
        duration?: number
        visible?: boolean,
        position?: number,
        animation?: boolean,
        opacity?: number,
        delay?: number,
        keyboardAvoiding?: boolean,
        hideOnPress?: boolean,
        onHide?: Function,
        onHidden?: Function,
        onShow?: Function,
        onShown?: Function,
        onPress?: Function
    }

    export interface ToastProps extends ToastOptions,ReactNative.ViewProperties{
    }

    export default class Toast extends React.Component<ToastProps>{
        static show:(message:string,options?:ToastOptions)=>any;
        static hide:(toast:any)=>void;
    }

    export class ToastContainer extends React.Component<ToastProps> {}
}
