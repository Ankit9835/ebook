import { Spinner } from '@heroui/react'
import React from 'react'
import { useDispatch } from 'react-redux'
import { Navigate, useSearchParams } from 'react-router-dom'
import { updateProfile } from '../store/auth'

const Verify = () => {
 const [searchParams] = useSearchParams()
 const profileInfoString = searchParams.get('profile')
 console.log('profile',profileInfoString)
 const dispatch = useDispatch()

 if(profileInfoString){
    try {
        const profile = JSON.parse(profileInfoString)
        console.log(profile)
        if(!profile.SignedUp) return <Navigate to='/new-user' />
        dispatch(updateProfile(profile))
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
