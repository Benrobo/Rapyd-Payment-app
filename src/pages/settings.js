import React from 'react'
import { Layout } from '../components'

function Settings() {
    return (
        <Layout sideBarActiveName="settings">
            <div className="relative  flex flex-row items-start justify-start w-full h-screen">
                <p>Settings</p>
            </div>
        </Layout>
    )
}

export default Settings