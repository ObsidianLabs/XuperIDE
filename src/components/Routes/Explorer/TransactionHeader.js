import React from 'react'

export default function TransactionHeader () {
  return (
    <tr>
      <th style={{ width: '10%' }}>time</th>
      <th style={{ width: '17%' }}>tx hash</th>
      <th style={{ width: '17%' }}>from</th>
      <th style={{ width: '17%' }}>to</th>
      <th style={{ width: '10%', textAlign: 'right' }}>value</th>
      <th style={{ width: '9%', textAlign: 'right' }}>fee</th>
      <th style={{ width: '20%' }}>description</th>
    </tr>
  )
}