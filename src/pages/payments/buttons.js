import React from 'react'
import { Layout, Loader } from '../../components'

function PaymentButotns() {
    return (
        <Layout sideBarActiveName="paymentButtons">
            <div className="relative  flex flex-row items-start justify-start w-full h-screen">
                <Loader type="mesage" text='COMING SOON' />
            </div>
        </Layout>
    )
}

export default PaymentButotns