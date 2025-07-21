import { Spinner } from '@heroui/react'
import React from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'

const Verify = () => {
 const [searchParams] = useSearchParams()
 const profileInfoString = searchParams.get('profile')

 if(profileInfoString){
    try {
        const profile = JSON.parse(profileInfoString)
        if(!profile.SignedUp) return <Navigate to='/new-user' />
        return <Navigate to='/' />
    } catch (error) {
        <Navigate to='/not-found' />
    }
 }
  return (
    <div className="flex items-center justify-center p-10">
      <Spinner label="Verifying..." color="warning" />
    </div>
  )
}

export default Verify
