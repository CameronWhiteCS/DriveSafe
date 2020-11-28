<?php

    interface Model {
        /**
         * Whether or not this model has been newly created. If a model is marked as new,
         * that means it does not yet exist in the database.
         */
        public function isNew();

        /**
         * Used for concurrency control. Returns the last date this object was modified. NULL for new records.
         */
        public function getModified();

        /**
         * Writes this object to the database and marks it as no longer being new.
         * Returns: true on success, false on failure. 
         */
        public function save();

        /**
         * Deletes this object from the database.
         * Returns: True on success, false on failure.
         */
        public function delete();

    }

?>