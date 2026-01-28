
import { gql } from '@apollo/client';

export const CREATE_ACTIVITY = gql`
  mutation CreateActivity($input: ActivitiesInsertInput!) {
    insertIntoActivitiesCollection(objects: [$input]) {
      records {
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
        projectId
        createdAt
        updatedAt
      }
    }
  }
`;

export const UPDATE_ACTIVITY = gql`
  mutation UpdateActivity($id: UUID!, $input: ActivitiesUpdateInput!) {
    updateActivitiesCollection(filter: { id: { eq: $id } }, set: $input) {
      records {
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
        updatedAt
      }
    }
  }
`;

export const DELETE_ACTIVITY = gql`
  mutation DeleteActivity($id: UUID!) {
    deleteFromActivitiesCollection(filter: { id: { eq: $id } }) {
      records {
        id
      }
    }
  }
`;

export const CREATE_COMMENT = gql`
  mutation CreateComment($input: ActivityCommentsInsertInput!) {
    insertIntoActivityCommentsCollection(objects: [$input]) {
      records {
        id
        activityId
        userId
        commentText
        createdAt
      }
    }
  }
`;

export const CREATE_PHOTO = gql`
  mutation CreatePhoto($input: ActivityPhotosInsertInput!) {
    insertIntoActivityPhotosCollection(objects: [$input]) {
      records {
        id
        activityId
        userId
        photoUrl
        caption
        createdAt
      }
    }
  }
`;

export const CREATE_PROJECT = gql`
  mutation CreateProject($input: ProjectsInsertInput!) {
    insertIntoProjectsCollection(objects: [$input]) {
      records {
        id
        name
        description
        status
        createdAt
        updatedAt
      }
    }
  }
`;

export const UPDATE_PROJECT = gql`
  mutation UpdateProject($id: UUID!, $input: ProjectsUpdateInput!) {
    updateProjectsCollection(filter: { id: { eq: $id } }, set: $input) {
      records {
        id
        name
        description
        status
        updatedAt
      }
    }
  }
`;

export const MARK_NOTIFICATION_AS_READ = gql`
  mutation MarkNotificationAsRead($id: UUID!) {
    updateNotificationsCollection(filter: { id: { eq: $id } }, set: { read: true }) {
      records {
        id
        read
      }
    }
  }
`;

export const CREATE_SUBTASK = gql`
  mutation CreateSubtask($input: ActivitySubtasksInsertInput!) {
    insertIntoActivitySubtasksCollection(objects: [$input]) {
      records {
        id
        activityId
        title
        description
        completed
        createdBy
        createdAt
      }
    }
  }
`;

export const UPDATE_SUBTASK = gql`
  mutation UpdateSubtask($id: UUID!, $input: ActivitySubtasksUpdateInput!) {
    updateActivitySubtasksCollection(filter: { id: { eq: $id } }, set: $input) {
      records {
        id
        title
        description
        completed
        completedAt
      }
    }
  }
`;
