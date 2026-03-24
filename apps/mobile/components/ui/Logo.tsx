import React from 'react';
import { Image } from 'react-native';

interface LogoProps {
    width?: number;
    height?: number;
}

export const Logo = ({ width = 40, height = 40 }: LogoProps) => {
    return (
        <Image
            source={require('../../assets/images/logo.png')}
            style={{ width, height, resizeMode: 'contain' }}
        />
    );
};
