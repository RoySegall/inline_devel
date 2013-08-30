<?php

/**
 * @file
 * File for the inline devel logs entity. For now holds variables of the schema.
 */

class InlineDevelLogs extends Entity {

  /**
   * @var
   * The identifier of the entry.
   */
  public $id;

  /**
   * @var
   * The unix time stamp the entry created at.
   */
  public $time;

  /**
   * @var
   * The code which the user submitted in the devel php form.
   */
  public $code;

  /**
   * @var
   * The user ID which the entry relate to.
   */
  public $uid;
}
