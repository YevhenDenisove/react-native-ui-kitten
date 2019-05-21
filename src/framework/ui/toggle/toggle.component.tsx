/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import React from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  StyleSheet,
  View,
  ViewProps,
  PanResponderInstance,
  GestureResponderEvent,
  PanResponderGestureState,
  TouchableOpacity,
  PanResponderCallbacks,
} from 'react-native';
import {
  StyledComponentProps,
  StyleType,
  Interaction,
  styled,
} from '@kitten/theme';
import { CheckMark } from '../support/components';

interface ComponentProps {
  checked?: boolean;
  disabled?: boolean;
  status?: string;
  size?: string;
  onChange?: (checked: boolean) => void;
}

export type ToggleProps = StyledComponentProps & ViewProps & ComponentProps;

/**
 * The `Toggle` component is an analog of html checkbox and radio buttons.
 *
 * @extends React.Component
 *
 * @property {boolean} value - Determines whether component is checked.
 *
 * @property {boolean} disabled - Determines whether component is disabled.
 * By default is false.
 *
 * @property {string} status - Determines the status of the component.
 * Can be 'primary' | 'success' | 'info' | 'warning' | 'danger'.
 * By default status='primary'.
 *
 * @property {string} size - Determines the size of the component.
 * Can be 'small' | 'medium' | 'large'.
 * By default size='medium'.
 *
 * @property {(value: boolean) => void} onChange - Triggered on change value.
 *
 * @property TouchableOpacityProps
 *
 * @property StyledComponentProps
 *
 * @example Simple usage example
 *
 * ```
 * import { Toggle } from '@kitten/ui';
 *
 * <Toggle value={true}/>
 * ```
 *
 * @example Toggle usage and API example
 *
 * ```
 * import { Toggle } from '@kitten/ui';
 *
 * state: State = {
 *   toggled: false,
 * };
 *
 * private onChange = (value: boolean): void => {
 *   this.setState({ toggled: value });
 * };
 *
 * public render(): React.ReactNode {
 *   return (
 *     <Toggle
 *       value={this.state.toggled}
 *       size='small'
 *       status='danger'
 *       onValueChange={this.onChange}
 *     />
 *   )
 * }
 * ```
 * */
export class ToggleComponent extends React.Component<ToggleProps> implements PanResponderCallbacks {

  static styledComponentName: string = 'Toggle';

  private panResponder: PanResponderInstance;
  private thumbWidthAnimation: Animated.Value;
  private thumbTranslateAnimation: Animated.Value;
  private ellipseScaleAnimation: Animated.Value;
  private thumbTranslateAnimationActive: boolean;

  constructor(props: ToggleProps) {
    super(props);

    const { checked, themedStyle } = props;

    this.thumbWidthAnimation = new Animated.Value(themedStyle.thumbWidth);
    this.thumbTranslateAnimation = new Animated.Value(0);
    this.ellipseScaleAnimation = new Animated.Value(checked ? 0.01 : 1.0);
    this.thumbTranslateAnimationActive = false;

    this.panResponder = PanResponder.create(this);
  }

  public onStartShouldSetPanResponder = (): boolean => {
    return true;
  };

  public onStartShouldSetPanResponderCapture = (): boolean => {
    return true;
  };

  public onMoveShouldSetPanResponder = (): boolean => {
    return true;
  };

  public onMoveShouldSetPanResponderCapture = (): boolean => {
    return true;
  };

  public onPanResponderTerminationRequest = (): boolean => {
    return false;
  };

  public onPanResponderGrant = () => {
    const { checked, disabled, themedStyle } = this.props;

    if (disabled) {
      return;
    }

    this.onPressIn();

    if (this.thumbTranslateAnimationActive) {
      this.thumbTranslateAnimationActive = false;
      this.stopAnimations();
      return;
    }

    this.animateThumbWidth(themedStyle.thumbWidth * 1.2);
    this.animateEllipseScale(checked ? 1 : 0.01);
  };

  public onPanResponderMove: () => boolean = (): boolean => {
    return true;
  };

  public onPanResponderRelease = (e: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    const { checked, disabled, themedStyle } = this.props;

    if (!disabled) {
      if ((!checked && gestureState.dx > -5) || (checked && gestureState.dx < 5)) {
        this.toggle(this.onPress);
      } else {
        this.animateEllipseScale(checked ? 0.01 : 1);
      }
    }

    this.animateThumbWidth(themedStyle.thumbWidth);
    this.onPressOut();
  };

  private onPressIn = () => {
    this.props.dispatch([Interaction.ACTIVE]);
  };

  private onPressOut = () => {
    this.props.dispatch([]);
  };

  private onPress = () => {
    if (this.props.onChange) {
      this.props.onChange(!this.props.checked);
    }
  };

  private getComponentStyle = (source: StyleType): StyleType => {
    const { style, checked, disabled } = this.props;

    const {
      outlineWidth,
      outlineHeight,
      outlineBorderRadius,
      outlineBackgroundColor,
      thumbWidth,
      thumbHeight,
      thumbBorderRadius,
      thumbBackgroundColor,
      iconWidth,
      iconHeight,
      iconTintColor,
      offsetValue,
      backgroundColor,
      borderColor,
      ...containerParameters
    } = source;

    const interpolatedBackgroundColor: Animated.AnimatedDiffClamp = this.getInterpolatedColor(
      backgroundColor,
      borderColor,
    );

    const interpolatedIconColor: Animated.AnimatedDiffClamp = this.getInterpolatedColor(
      thumbBackgroundColor,
      iconTintColor,
    );

    const thumbScale: Animated.AnimatedDiffClamp = this.animateThumbScale(offsetValue);

    return {
      container: {
        ...styles.container,
        ...StyleSheet.flatten(style),
      },
      componentContainer: {
        borderColor: borderColor,
        backgroundColor: interpolatedBackgroundColor,
        ...containerParameters,
        ...styles.componentContainer,
      },
      highlight: {
        width: outlineWidth,
        height: outlineHeight,
        borderRadius: outlineBorderRadius,
        backgroundColor: outlineBackgroundColor,
        ...styles.highlight,
      },
      ellipse: {
        width: containerParameters.width - (containerParameters.borderWidth * 2),
        height: containerParameters.height - (containerParameters.borderWidth * 2),
        borderRadius: (source.height - (source.borderWidth * 2)) / 2,
        backgroundColor: interpolatedBackgroundColor,
        transform: [{ scale: checked ? thumbScale : this.ellipseScaleAnimation }],
        ...styles.ellipse,
      },
      thumb: {
        alignSelf: checked ? 'flex-end' : 'flex-start',
        width: this.thumbWidthAnimation,
        height: thumbHeight,
        borderRadius: thumbBorderRadius,
        backgroundColor: thumbBackgroundColor,
        elevation: disabled ? 0 : 5,
        transform: [{ translateX: this.thumbTranslateAnimation }],
        ...styles.thumb,
      },
      icon: {
        width: source.iconWidth,
        height: source.iconHeight,
        backgroundColor: interpolatedIconColor,
      },
    };
  };

  private animateThumbTranslate = (value: number, callback: () => void = () => null) => {
    this.thumbTranslateAnimationActive = true;

    Animated.timing(this.thumbTranslateAnimation, {
      toValue: value,
      duration: 150,
      easing: Easing.linear,
    }).start(() => {
      this.thumbTranslateAnimationActive = false;
      callback();
    });
  };

  private animateThumbWidth = (value: number, callback: () => void = () => null) => {
    Animated.timing(this.thumbWidthAnimation, {
      toValue: value,
      duration: 150,
      easing: Easing.linear,
    }).start(callback);
  };

  private animateEllipseScale = (value: number, callback: () => void = () => null) => {
    Animated.timing(this.ellipseScaleAnimation, {
      toValue: value,
      duration: 200,
      easing: Easing.linear,
    }).start(callback);
  };

  private animateThumbScale = (value: number): Animated.AnimatedDiffClamp => {
    return this.thumbTranslateAnimation.interpolate({
      inputRange: [-value, 0],
      outputRange: [1, 0.01],
    });
  };

  private stopAnimations = () => {
    const value: number = this.props.checked ? 0.01 : 1;

    this.thumbTranslateAnimation.stopAnimation();
    this.ellipseScaleAnimation.stopAnimation();
    this.thumbWidthAnimation.stopAnimation();

    this.ellipseScaleAnimation.setValue(value);
  };

  private toggle = (callback = (nextValue: boolean) => null) => {
    const { checked, themedStyle } = this.props;

    const value: number = checked ? -themedStyle.offsetValue : themedStyle.offsetValue;

    this.animateThumbTranslate(value, () => {
      this.thumbTranslateAnimation.setValue(0);
      callback(!checked);
    });

    this.animateThumbWidth(this.props.themedStyle.thumbWidth);
  };

  private getInterpolatedColor = (startColor: string, endColor: string): Animated.AnimatedDiffClamp => {
    const { checked, themedStyle } = this.props;

    return this.thumbTranslateAnimation.interpolate({
      inputRange: checked ? [-themedStyle.offsetValue, 0] : [0, themedStyle.offsetValue],
      outputRange: [startColor, endColor],
    });
  };

  public render(): React.ReactElement<ViewProps> {
    const { themedStyle, disabled, checked, ...restProps } = this.props;
    const componentStyle: StyleType = this.getComponentStyle(themedStyle);

    return (
      <View
        {...restProps}
        style={componentStyle.container}>
        <View style={componentStyle.highlight}/>
        <TouchableOpacity
          onPressIn={this.onPressIn}
          onPressOut={this.onPressOut}
          onPress={this.onPress}>
          <Animated.View
            style={componentStyle.componentContainer}
            {...this.panResponder.panHandlers}>
            <Animated.View style={componentStyle.ellipse}/>
            <Animated.View style={componentStyle.thumb}>
              <CheckMark
                style={componentStyle.icon}
                isAnimated={true}
              />
            </Animated.View>
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  componentContainer: {
    justifyContent: 'center',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  ellipse: {
    alignSelf: 'center',
    position: 'absolute',
  },
  highlight: {
    alignSelf: 'center',
    position: 'absolute',
  },
  thumb: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const Toggle = styled<ToggleProps>(ToggleComponent);
