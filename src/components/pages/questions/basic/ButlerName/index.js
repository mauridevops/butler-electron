import React, { useState } from 'react';

import QuestionTitle from '../../../../common/QuestionTitle';
import Input from '../../../../common/Input';

import { useButlerConfig } from '../../../../../context/ConfigContext';

// import JellyIcon from '../../../../../common/Icons/JellyIcon';

import './style.scss';

const ButlerName = () => {
  const [config, updateConfig] = useButlerConfig();
  const [isValid, setIsValid] = useState(false);

  const handleOnChange = ({ target: { value } }) => {
    if (value) {
      setIsValid(true);
      updateConfig({ NAME: value });
    } else {
      setIsValid(false);
      updateConfig({ NAME: '' });
    }
  };

  return (
    <div className='butler-name-wrapper'>
      <QuestionTitle title='Butler name' isValid={isValid} />
      <div className='name-wrapper'>
        <Input type='text' value={config.NAME} onChange={handleOnChange} />
        {!isValid && (
          // <JellyIcon className='butler-name-icon'>
          <p>Butler Name is required</p>
          // </JellyIcon>
        )}
      </div>
    </div>
  );
};

export default ButlerName;
