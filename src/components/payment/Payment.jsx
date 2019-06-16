import React, { PureComponent } from 'react';
import { css } from 'aphrodite/no-important';
import MaskedInput from 'react-text-mask';

import styles from './styles';
import Cart from '../common/cart/Cart';
import DataStore from '../common/dataStore/DataStore';
import CalcBox from '../common/calcBox/CalcBox';

import ContinueButton from '../common/continueButton/ContinueButton';

import { isEmptyObj } from '../../utils/isEmpty';

class Payment extends PureComponent {

  focus = '';

  objProducts = Cart.shared();

  userData = DataStore.shared('userData');

  sharedEnableSuccess = DataStore.shared('enableSuccess');

  componentDidMount = async () => {

    if (isEmptyObj(this.objProducts)) {

      await Cart.download();
      this.forceUpdate();

    }

  }

  maskFunction = (validationType) => {

    switch (validationType) {

      case 'date':
        return [/[0-1]/, /\d/, '/', /2/, /0/, /\d/, /\d/];
      case 'card':
        return [/\d/, /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, /\d/];
      case 'cvv':
        return [/\d/, /\d/, /\d/];
      default:
        return [];

    }

  }

  valueCardChanged = (event) => {

    const { value } = event.target;
    this.userData.valueCardDirty = value;
    this.userData.valueCard = value.replace(/_/g, '');
    this.forceUpdate();

  }

  valueNameChanged = (event) => {

    const { value } = event.target;
    this.userData.valueName = value;
    this.forceUpdate();

  }

  valueExpiresChanged = (event) => {

    const { value } = event.target;
    this.userData.valueExpiresDirty = value;
    this.userData.valueExpires = value.replace(/_/g, '');
    this.forceUpdate();

  }

  valueCvvChanged = (event) => {

    const { value } = event.target;
    this.userData.valueCvvDirty = value;
    this.userData.valueCvv = value.replace(/_/g, '');
    this.forceUpdate();

  }

  onFocus = (id) => {

    this.focus = id;
    this.forceUpdate();

  }

  onBlur = (id) => {

    if (this.focus === id) {

      this.focus = '';
      this.forceUpdate();

    }

  }

  render() {

    if (isEmptyObj(this.objProducts)) {

      /**
       * TODO: maybe create here a message/image "Carregando..."
       */
      return null;

    }

    const {
      items,
      error,
    } = this.objProducts;

    // TODO: do a better error/empty bag handling
    if (error) return (
      <div className={css(styles.errorMsg)}>{error}</div>
    );
    if (!items) return (
      <div className={css(styles.errorMsg)}>Sem itens na sacola</div>
    );

    const {
      valueCardDirty = '',
      valueCard = '',
      valueName = '',
      valueExpiresDirty = '',
      valueExpires = '',
      valueCvvDirty = '',
      valueCvv = '',
    } = this.userData;

    const cardValid = valueCard.length === 19;
    const cvvValid = valueCvv.length === 3;
    const expiresValid = valueExpires.length === 7;

    this.sharedEnableSuccess.enabled = cardValid
      && expiresValid
      && cvvValid
      && valueName.length > 4;

    const errorCard = this.focus !== 'card' && !cardValid && valueCard.length !== 0;
    const errorCvv = this.focus !== 'cvv' && !cvvValid && valueCvv.length !== 0;
    const errorExp = this.focus !== 'exp' && !expiresValid && valueExpires.length !== 0;

    return (
      <div className={css(styles.container)}>
        <div className={css(styles.content)}>

          <div className={css(styles.prodCalc)}>

            <div>
              <div className={css(styles.title)}>
                CARTÃO DE CRÉDITO
              </div>
              <div className={css(styles.formBox)}>
                <div className={css(styles.inputBox)}>
                  <div className={css(styles.inputLabel)}>
                    Número do cartão:
                  </div>
                  <MaskedInput
                    className={css(styles.inputBig)}
                    value={valueCardDirty || ''}
                    onChange={this.valueCardChanged}
                    mask={() => this.maskFunction('card')}
                    onFocus={() => this.onFocus('card')}
                    onBlur={() => this.onBlur('card')}
                  />
                  {errorCard && (
                    <div className={css(styles.error)}>
                      Cartão inválido
                    </div>
                  )}
                </div>
                <div className={css(styles.inputBox)}>
                  <div className={css(styles.inputLabel)}>
                    Nome do Titular:
                  </div>
                  <input
                    type="text"
                    className={css(styles.inputBig)}
                    value={valueName || ''}
                    onChange={this.valueNameChanged}
                    placeholder="Como no cartão"
                  />
                </div>
                <div className={css(styles.inputBox, styles.inputBoxDual)}>
                  <div>
                    <div className={css(styles.inputLabel)}>
                      Validade (mês/ano):
                    </div>
                    <div>
                      <MaskedInput
                        className={css(styles.inputBig, styles.inputExpires)}
                        value={valueExpiresDirty || ''}
                        onChange={this.valueExpiresChanged}
                        mask={() => this.maskFunction('date')}
                        onFocus={() => this.onFocus('exp')}
                        onBlur={() => this.onBlur('exp')}
                      />
                    </div>
                    {errorExp && (
                      <div className={css(styles.error)}>
                        Data inválida
                      </div>
                    )}
                  </div>
                  <div>
                    <div className={css(styles.inputLabel)}>
                      CVV:
                    </div>
                    <MaskedInput
                      className={css(styles.inputBig, styles.inputCV)}
                      value={valueCvvDirty || ''}
                      onChange={this.valueCvvChanged}
                      mask={() => this.maskFunction('cvv')}
                      onFocus={() => this.onFocus('cvv')}
                      onBlur={() => this.onBlur('cvv')}
                    />
                    {errorCvv && (
                      <div className={css(styles.error)}>
                        CVV inválido
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
            <CalcBox />

          </div>

          <div className={css(styles.continueDiv)}>
            <ContinueButton
              link="/sucesso"
              label="FINALIZAR O PEDIDO"
              enable={this.sharedEnableSuccess.enabled}
            />
          </div>

        </div>
      </div>
    );

  }

}

export default Payment;
