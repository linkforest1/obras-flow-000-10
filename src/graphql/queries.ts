
import { gql } from '@apollo/client';

export const GET_ACTIVITIES = gql`
  query GetActivities {
    activitiesCollection {
      edges {
        node {
          id
          title
          description
          status
          priority
          progress
          startDate
          endDate
          location
          discipline
          createdAt
          updatedAt
          project {
            id
            name
            description
          }
          comments {
            edges {
              node {
                id
                commentText
                createdAt
                userId
              }
            }
          }
          photos {
            edges {
              node {
                id
                photoUrl
                caption
                createdAt
                userId
              }
            }
          }
          subtasks {
            edges {
              node {
                id
                title
                description
                completed
                completedAt
                createdAt
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_ACTIVITY_BY_ID = gql`
  query GetActivityById($id: UUID!) {
    activitiesCollection(filter: { id: { eq: $id } }) {
      edges {
        node {
          id
          title
          description
          status
          priority
          progress
          startDate
          endDate
          location
          discipline
          createdAt
          updatedAt
          project {
            id
            name
            description
          }
          comments {
            edges {
              node {
                id
                commentText
                createdAt
                userId
              }
            }
          }
          photos {
            edges {
              node {
                id
                photoUrl
                caption
                createdAt
                userId
              }
            }
          }
          subtasks {
            edges {
              node {
                id
                title
                description
                completed
                completedAt
                createdAt
              }
            }
          }
          assignments {
            edges {
              node {
                id
                userId
                role
                assignedAt
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_PROJECTS = gql`
  query GetProjects {
    projectsCollection {
      edges {
        node {
          id
          name
          description
          status
          createdAt
          updatedAt
          activities {
            edges {
              node {
                id
                title
                status
                priority
                progress
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_USER_NOTIFICATIONS = gql`
  query GetUserNotifications($userId: UUID!) {
    notificationsCollection(filter: { userId: { eq: $userId } }) {
      edges {
        node {
          id
          title
          message
          type
          read
          createdAt
          relatedEntityType
          relatedEntityId
        }
      }
    }
  }
`;

export const GET_BOARDS = gql`
  query GetBoards($userId: UUID!) {
    boardsCollection(filter: { userId: { eq: $userId } }) {
      edges {
        node {
          id
          name
          createdAt
          lists {
            edges {
              node {
                id
                name
                listOrder
                tasks {
                  edges {
                    node {
                      id
                      name
                      dueDate
                      taskOrder
                      createdAt
                      updatedAt
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
