import React from 'react';
import { Table } from 'react-bootstrap';

const SearchResults = (props) => {


    const onClick = (user) => {

        props.setUser(user);
        const newIds = [];
        user.groups.forEach((group, index) => {
            newIds.push(group.id);
        });
        props.setGroupIds(newIds);
    }

    return (
        <React.Fragment>
            <h2>Search Results</h2>
            <Table variant="light">
                <thead>
                    <tr>
                        <th>User ID</th>
                        <th>First name</th>
                        <th>Last name</th>
                        <th>Email</th>
                        <th>Groups</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        props.users.map((user, id) => {
                            return (
                                <tr key={id} onClick={() => { onClick(user) }} style={{ textDecoration: props.selected && props.selected.id === user.id ? 'underline' : 'none' }}>
                                    <td>{user.id}</td>
                                    <td>{user.firstName}</td>
                                    <td>{user.lastName}</td>
                                    <td>{user.email}</td>
                                    <td>{user.groups.map((group, id) => {
                                        return (
                                            <React.Fragment key={id}>
                                                {group.name}{id < user.groups.length - 1 && ', '}
                                            </React.Fragment>
                                        );
                                    })}</td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </Table>
        </React.Fragment>
    );
}

export default SearchResults;