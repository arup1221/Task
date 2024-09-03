import React, { useRef, useState } from 'react';
import { OverlayPanel } from 'primereact/overlaypanel';
import { FaChevronDown } from "react-icons/fa6";
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import './OverLayPannel.css';

interface OverlayPanelComponentProps {
    onValueSubmit: (value: number) => void;
}

const OverlayPanelComponent: React.FC<OverlayPanelComponentProps> = ({ onValueSubmit }) => {
    const op = useRef<any>(null);
    const [value, setValue] = useState<number | null>(0);

    const handleSubmit = () => {
        if (value !== null) {
            onValueSubmit(value);
            op.current.hide();
        }
    };

    return (
        <div>
            <FaChevronDown onClick={(e) => op.current.toggle(e)} style={{ cursor: 'pointer' }} />
            <OverlayPanel ref={op}>
                <div className='body'>
                    <InputText
                        value={value ?? ''}
                        onChange={(e) => {
                            const newValue = e.target.value;
                            const parsedValue = newValue === '' ? null : parseFloat(newValue);
                            setValue(isNaN(parsedValue) ? null : parsedValue);
                        }}
                    />
                    <Button label="Submit" className='button' onClick={handleSubmit} />
                </div>
            </OverlayPanel>
        </div>
    );
};

export default OverlayPanelComponent;
