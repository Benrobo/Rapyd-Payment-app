import React from 'react'
import { Layout, Loader } from '../../components'

function Store() {
    return (
        <Layout sideBarActiveName="store">
            <div className="w-full relative h-screen">
                <div id="head" className="w-full h-auto text-center flex flex-col items-center justify-center p-10 mt-10">
                    <p className="text-dark-100 text-[20px] font-extrabold ">RayPal Store</p>
                    <p className="text-dark-100 text-[15px] ">
                        RayPal store makes it easy for <kbd>customers</kbd> or <kbd>merchants</kbd> to create a seamlessm online virtual store. Manage products and accept payment from individual created products.
                    </p>
                    <Loader type="mesage" text='COMING SOON' />
                </div>
            </div>
        </Layout>
    )
}

export default Store