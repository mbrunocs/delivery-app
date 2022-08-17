import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import OrderDetail from '../OrderDetail';

import * as S from './styled';

export default function DetailsList() {
  const [data, setData] = useState();
  const { token: authorization } = JSON.parse(localStorage.getItem('user'));
  const { id, role } = useParams();
  const [orderStatus, setOrderStatus] = useState('Pendente');

  useEffect(() => {
    const fetchOrders = async () => {
      const instance = axios.create({
        baseURL: 'http://localhost:3001/',
      });
      const endpoint = `${role}/orders/${id}`;

      const { data: {
        saleDate,
        products,
        seller,
        status,
        totalPrice,
      } } = await instance.get(endpoint, {
        headers: { authorization },
      });

      setData({
        saleDate,
        products,
        seller,
        status,
        totalPrice: Number(totalPrice).toLocaleString('pt-BR', {
          style: 'currency', currency: 'BRL',
        }),
      });
    };
    fetchOrders();
  }, [authorization, id, role]);

  const handleStatusChange = async (e) => {
    e.preventDefault();

    const status = e.target.value;
    const instance = axios.create({
      baseURL: 'http://localhost:3001/',
    });
    const endpoint = `${role}/orders/${id}`;
    const { data: poxe } = await instance.patch(endpoint, { status }, {
      headers: { authorization },
    });
    console.log(poxe);
    setOrderStatus(status);
  };

  return data ? (
    <S.DetailHeader>
      <S.DetailOrderId
        data-testid={
          `${role}_order_details__element-order-details-label-order-id`
        }
      >
        { `Pedido ${id}` }
      </S.DetailOrderId>
      <S.DetailDate
        data-testid={ `${role}_order_details__element-order-details-label-order-date` }
      >
        { new Date(data.saleDate).toLocaleDateString('pt-BR') }
      </S.DetailDate>
      {
        role === 'customer' ? (
          <>
            <S.DetailSeller
              data-testid={
                `${role}_order_details__element-order-details-label-seller-name`
              }
            >
              { data.seller.name }
            </S.DetailSeller>
            <S.DetailDelivered
              data-testid={ `${role}_order_details__button-delivery-check` }
              disabled={ data.status === 'Pendente' }
            >
              Marcar como entregue
            </S.DetailDelivered>
          </>
        ) : (
          <>
            <S.DetailPrepareOrder
              disabled={ orderStatus !== 'Pendente' }
              type="button"
              value="Preparando"
              data-testid={
                `${role}_order_details__button-preparing-check`
              }
              onClick={ (e) => handleStatusChange(e) }
            >
              PREPARAR PEDIDO
            </S.DetailPrepareOrder>
            <S.DetailDeliverOrder
              disabled={ orderStatus !== 'Preparando' }
              type="button"
              value="Em Trânsito"
              data-testid={
                `${role}_order_details__button-dispatch-check`
              }
              onClick={ (e) => handleStatusChange(e) }
            >
              SAIU PARA ENTREGA
            </S.DetailDeliverOrder>
          </>
        )
      }
      <S.DetailStatus
        data-testid={
          `${role}_order_details__element-order-details-label-delivery-status`
        }
      >
        { orderStatus }
      </S.DetailStatus>
      {
        data.products.map(({
          name,
          salesProducts,
          price,
        }, index) => (
          <OrderDetail
            role={ role }
            key={ index }
            index={ index + 1 }
            name={ name }
            quantity={ salesProducts.quantity }
            price={ price }
          />
        ))

      }
      <S.DetailTotalPrice
        data-testid={
          `${role}_order_details__element-order-total-price`
        }
      >
        {
          (data.totalPrice)
        }
      </S.DetailTotalPrice>
    </S.DetailHeader>
  ) : <h1>Loading</h1>;
}
