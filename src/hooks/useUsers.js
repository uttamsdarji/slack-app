import React, { useState, useEffect } from 'react';
import axios from 'axios';

const useUsers = () => {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    let url = (process.env.NODE_ENV == 'development' ? 'http://127.0.0.1:3002' : 'https://slack.uttamsdarji.online:3002') + '/get-users';
    axios.get(url).then((response) => {
      if (response?.data) {
        setUsers(response.data)
      }
    }).catch(() => {
      
    })
  },[])
  return {users}
}

export default useUsers;